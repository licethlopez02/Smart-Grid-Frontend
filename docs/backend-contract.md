# Contrato del backend Smart Grid G9

Base: todo pasa por el API Gateway (http://localhost:8000). En dev el navegador usa el proxy de Vite (/api -> 8000). El backend NO tiene CORS.

## Autenticación
- Header: Authorization: Bearer <token>. JWT HS256, 60 min.
- Claims: sub = id de usuario (texto), correo, roles (lista: "USUARIO" | "OPERADOR"), iss, iat, exp.
- 401 y 403 de seguridad NO traen cuerpo JSON: manejarlos solo por status.

## Errores de la aplicación
Cuerpo: { "mensaje": string }. Usuarios: 400 validación. Medición: 409 negocio, 400 argumento inválido. Facturación: 400, 403, 404, 409, 503.

## Endpoints
Usuarios
- POST /api/auth/registro (público) body {nombre, correo, contrasena (mín. 8)} -> UsuarioResponse, 201
- POST /api/auth/login (público) body {correo, contrasena} -> TokenResponse, 200
- GET /api/usuarios/me -> UsuarioResponse
- PUT /api/usuarios/me/contrasena body {contrasenaActual, contrasenaNueva (mín. 8)} -> 204
- (OPERADOR) GET /api/usuarios; GET /api/usuarios/{id}; PUT /api/usuarios/{id}/roles {roles: string[]}; PATCH /api/usuarios/{id}/estado {activo: boolean}
  - GET /api/usuarios devuelve UsuarioResponse[] sin paginación ni filtros.

Medición (dueño del medidor u OPERADOR, salvo indicación). desde/hasta opcionales, ISO con hora, ej. 2026-10-01T00:00:00Z, inclusivos.
- POST /api/medidores (OPERADOR) body {id, ubicacion, usuarioId, propiedad} -> MedidorResponse, 201
  - `id` obligatorio (lo envía el cliente). `ubicacion` obligatoria, no vacía. `usuarioId` opcional. `propiedad` opcional; si falta, el backend usa la ubicación.
  - Errores 400 con `{ mensaje }`: "Ya existe un medidor con id X"; "El usuario no existe o está inactivo".
  - No hay comprobación de propiedad repetida. No hay endpoint para reasignar ni para listar medidores.
- GET /api/medidores/mios -> MedidorResponse[] (requiere sesión; toma el id del usuario del JWT y devuelve un arreglo de MedidorResponse { id, ubicacion, usuarioId, propiedad } con los medidores de ese usuario; arreglo vacío si no tiene)
- POST /api/medidores/{medidorId}/lecturas body {valor, timestamp} -> {esAnomalia: boolean, razon: string}. Valor negativo: se descarta y se genera alerta de sensor defectuoso (no se guarda anomalía).
- GET /api/medidores/{medidorId}/lecturas?desde&hasta -> LecturaResponse[]
- GET /api/medidores/{medidorId}/consumo?desde&hasta -> ConsumoResponse (acumulado del rango; NO hay agregación por día/mes)
- GET /api/medidores/{medidorId}/anomalias -> AnomaliaResponse[]
- GET /api/medidores/{medidorId}/anomalias/pendientes?desde&hasta -> AnomaliaResponse[]
- POST /api/medidores/{medidorId}/anomalias/{anomaliaId}/resolver -> 204
- GET /api/medidores/consumo-por-zona?zona=&desde=&hasta= (OPERADOR) -> [{zona, consumoAcumulado}]
  - `zona` obligatoria; `desde` y `hasta` opcionales (instante ISO, ej. 2026-11-01T00:00:00Z). Comparación de zona sin distinguir mayúsculas; sin recortar espacios.
  - Si ninguna ubicación coincide: 200 con []. Zona en blanco: 400 "La zona es obligatoria".
  - El consumo es la suma de los valores de las lecturas del rango (ambos extremos inclusivos).
- DELETE /api/medidores/{medidorId} (OPERADOR) -> 202
- POST /api/anomalias/{anomaliaId}/resolver (OPERADOR) -> 204
- NO existe endpoint para listar zonas.

Facturación
- GET /api/facturas/mias -> FacturaResponse[] (por sub del JWT)
- GET /api/facturas/{id} (dueño u OPERADOR) -> FacturaResponse
- GET /api/facturas?medidorId= (dueño u OPERADOR) -> FacturaResponse[]
- POST /api/facturas (OPERADOR) body {medidorId, periodoInicio, periodoFin} (AAAA-MM-DD) -> FacturaResponse, 201
- POST /api/facturas/mensual?mes=AAAA-MM (OPERADOR) -> {mes, generadas, duplicadas, rechazadas: string[]}
- POST /api/facturas/{id}/pago (OPERADOR) -> FacturaResponse
- POST /api/tarifas (OPERADOR) body {valor, vigenciaDesde, vigenciaHasta} -> TarifaResponse, 201
- GET /api/tarifas (autenticado) -> TarifaResponse[]
- Estados: PENDIENTE | PAGADA | VENCIDA. VENCIDA se calcula al serializar (no se persiste). Vencimiento = generación + 15 días.

## DTOs
UsuarioResponse {id, nombre, correo, roles: string[], activo}
TokenResponse {token, tipo ("Bearer"), expiraEnSegundos}
MedidorResponse {id, ubicacion, usuarioId | null, propiedad}
LecturaResponse {valor, timestamp, medidorId}
ConsumoResponse {consumoAcumulado, desde, hasta}
AnomaliaResponse {id, valor, timestamp, razon, resuelta: boolean}  // NO hay campo tipo
TarifaResponse {id, valor, vigenciaDesde, vigenciaHasta}
AnomaliaFacturada {anomaliaId, valor, momento, razon}
FacturaResponse {id, medidorId, periodoInicio, periodoFin, montoTotal, estado, consumoAcumuladoKwh, tarifaValor, tarifaVigenciaDesde, tarifaVigenciaHasta, fechaGeneracion, fechaVencimiento, fechaPago | null, anomaliasNoResueltas: AnomaliaFacturada[]}

## Notas de comportamiento del backend

### Campos nullable
- `TarifaResponse.vigenciaHasta` y `FacturaResponse.tarifaVigenciaHasta` pueden ser `null` (tarifa sin fecha de fin).

### Validación de período para facturar
- La primera lectura del historial debe ser `<= periodoInicio` a las `00:00:00Z` y la última `>= periodoFin` a las `23:59:59Z` (UTC).
- La tarifa debe cumplir `vigenciaDesde <= periodoFin <= vigenciaHasta` (o no tener fecha de fin).
- Si falla, `409` con `"No se puede generar la factura del medidor N: el período está incompleto o la tarifa no está vigente."`.

### Cálculo de consumo y monto
- Consumo = suma de los valores de las lecturas con `timestamp` dentro de `[desde, hasta]`, ambos inclusivos.
- Monto de factura = consumo × tarifa.

### Detección de anomalías
- Cada lectura nueva se compara con el promedio de todo el historial del medidor.
- Es anomalía si `|valor - promedio| / promedio > 0.5` (estricto).
- La primera lectura nunca es anomalía.
- Si el promedio es `0`, cualquier lectura positiva es anomalía.

### Registro y contraseña
- Registro con correo repetido: `409`.
- Cambio de contraseña con la actual incorrecta: `400` `"La contraseña actual es incorrecta"`.
- Una contraseña de menos de 8 caracteres da `400` con un mensaje técnico en inglés; por eso el front valida el largo antes de enviar.
- Cambiar la contraseña **no** invalida el token actual.

### Precisiones y aclaraciones del contrato
- **Errores 401 y 403 de Spring Security**: no traen cuerpo JSON (solo los errores de la aplicación traen `{"mensaje": "..."}`); deben manejarse únicamente por código de estado HTTP.
- **Factura inexistente**: actualmente `GET /api/facturas/{id}` con id inexistente responde `400` (se corregirá a `404` más adelante).
- **Lectura con valor negativo**: `POST /api/medidores/{id}/lecturas` con un valor negativo responde `200` con `{ "esAnomalia": false, "razon": "..." }` (se descarta y se genera alerta de sensor defectuoso, sin registrar anomalía).
- **Endpoints existentes no usados en el frontend**: los endpoints `GET /api/usuarios/{id}`, `PUT /api/usuarios/{id}/roles`, `PATCH /api/usuarios/{id}/estado`, `DELETE /api/medidores/{id}` y `POST /api/facturas/{id}/pago` existen en el backend pero NO se usan en el frontend por estar fuera de Requisitos_G9.

## Lo que NO existe
CORS, SSE/WebSocket/correo para alertas (solo polling), campo tipo en anomalías, listado de zonas, edición/borrado de tarifas.
