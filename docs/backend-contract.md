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

Medición (dueño del medidor u OPERADOR, salvo indicación). desde/hasta opcionales, ISO con hora, ej. 2026-10-01T00:00:00Z, inclusivos.
- POST /api/medidores (OPERADOR) body {id, ubicacion, usuarioId, propiedad} -> MedidorResponse, 201
- POST /api/medidores/{medidorId}/lecturas body {valor, timestamp} -> {esAnomalia: boolean, razon: string}. Valor negativo: se descarta y se genera alerta de sensor defectuoso (no se guarda anomalía).
- GET /api/medidores/{medidorId}/lecturas?desde&hasta -> LecturaResponse[]
- GET /api/medidores/{medidorId}/consumo?desde&hasta -> ConsumoResponse (acumulado del rango; NO hay agregación por día/mes)
- GET /api/medidores/{medidorId}/anomalias -> AnomaliaResponse[]
- GET /api/medidores/{medidorId}/anomalias/pendientes?desde&hasta -> AnomaliaResponse[]
- POST /api/medidores/{medidorId}/anomalias/{anomaliaId}/resolver -> 204
- GET /api/medidores/consumo-por-zona?zona&desde&hasta (OPERADOR) -> [{zona, consumoAcumulado}] (zona = ubicacion, comparación sin distinguir mayúsculas)
- DELETE /api/medidores/{medidorId} (OPERADOR) -> 202
- POST /api/anomalias/{anomaliaId}/resolver (OPERADOR) -> 204
- NO existe endpoint para listar los medidores de un usuario ni para listar zonas.

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

## Lo que NO existe
CORS, SSE/WebSocket/correo para alertas (solo polling), campo tipo en anomalías, listado de medidores por usuario, listado de zonas, edición/borrado de tarifas.
