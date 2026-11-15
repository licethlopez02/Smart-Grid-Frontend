# Smart Grid G9: Frontend

Aplicación web de Smart Grid: el usuario consulta su consumo, sus alertas y sus facturas, y el operador de red registra medidores y consulta el consumo por zona. Se conecta al backend a través del API Gateway.

- **Stack:** React 19, Vite 8, TypeScript 6, Tailwind, TanStack Query, React Router, Axios, Recharts e i18next.
- **Backend:** repositorio `SmartGrid_G9` (ver su README para levantarlo).
- **Contrato con el backend:** [`docs/backend-contract.md`](docs/backend-contract.md).

## Requisitos

- Node.js 18 o superior. Vite puede exigir una versión más reciente: si `npm install` o `npm run dev` se quejan de la versión, actualiza a la versión LTS de Node.
- El backend en marcha (gateway en `http://localhost:8000`).

## Cómo ejecutarlo

```powershell
cd Smart-Grid-Frontend
npm install
npm run dev
```

La primera vez ejecuta `npm install`. Abre `http://localhost:5173`. En desarrollo, las peticiones a `/api` se redirigen al gateway en `http://localhost:8000` (proxy de Vite, `vite.config.ts`).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (puerto 5173) |
| `npm run build` | Revisa tipos y genera la versión de producción en `dist/` |
| `npm run lint` | Revisa el código con ESLint |
| `npm run preview` | Sirve la versión de `dist/` |

No hay pruebas automáticas del frontend. La verificación se hace con `lint`, `build` y la prueba manual de abajo.

## Pantallas y roles

| Ruta | Quién | Qué muestra |
| --- | --- | --- |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Crear una cuenta (siempre con rol usuario) |
| `/` | Cualquier sesión | Inicio del usuario; el operador es redirigido a "Consumo por zona" |
| `/account` | Cualquier sesión | Mi cuenta y cambio de contraseña |
| `/consumption` | Usuario | Historial de consumo con gráfico y selector de período (HU-07) |
| `/alerts` | Usuario | Anomalías del medidor, se actualiza cada 30 s, con botón Resolver (HU-05) |
| `/invoices` | Usuario | Lista de facturas con su estado (HU-08) |
| `/invoices/:id` | Usuario | Detalle: período, consumo, tarifa, total y anomalías no resueltas (HU-08, R3) |
| `/operator/meters/new` | Operador | Registrar un medidor y asociarlo a un usuario (HU-01) |
| `/operator/zones` | Operador | Consumo agregado por zona (HU-09) |

Menú del usuario: Inicio, Consumo, Alertas, Facturas. Menú del operador: Registrar medidor, Consumo por zona. En ambos: Mi cuenta y Cerrar sesión.

Un usuario no puede abrir pantallas de operador y al revés. Al vencerse la sesión (el token dura 60 minutos) o ante un 401, se limpia la sesión y se vuelve a `/login`.

## Cuentas de desarrollo

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Operador | `operador@smartgrid.local` | `Operador123!` |
| Usuario | La que crees en `/register` | La que elijas |

La cuenta del operador la crea el backend al arrancar.

## Simulador de medidor

El medidor inteligente envía las lecturas; como no tiene pantalla, se simula con `scripts/simulador-medidor.mjs`. Requiere Node 18 o superior y que el medidor ya esté registrado por el operador.

```powershell
# Cuatro lecturas: 1, 1, 2 (anomalía) y -5 (sensor defectuoso)
node scripts/simulador-medidor.mjs escenario 30

# Envío continuo: una lectura cada 5 s, un pico cada 10 lecturas (Ctrl+C para detener)
node scripts/simulador-medidor.mjs continuo 30 --cada 5

# Una sola lectura
node scripts/simulador-medidor.mjs lectura 30 7
```

El número es el id del medidor. Opciones del modo continuo: `--cada` (segundos entre lecturas, por defecto 5), `--pico` (cada cuántas lecturas se envía un pico, por defecto 10) y `--base` (valor base, por defecto 1).

Por defecto entra como operador. Variables opcionales:

| Variable | Por defecto |
| --- | --- |
| `SIM_BASE_URL` | `http://localhost:8000` |
| `SIM_CORREO` | `operador@smartgrid.local` |
| `SIM_CONTRASENA` | La del operador de desarrollo |

Para enviar como el dueño del medidor:

```powershell
$env:SIM_CORREO = "correo.de.la.cuenta@ejemplo.com"
$env:SIM_CONTRASENA = "clave12345"
```

## Prueba manual rápida

Con el backend en marcha:

1. Regístrate en `/register` y revisa que Inicio, Consumo, Alertas y Facturas muestren estados vacíos legibles.
2. Cierra sesión, entra como operador y registra un medidor (id `30`, ubicación `Tunja Centro`, usuario = tu cuenta).
3. Ejecuta `node scripts/simulador-medidor.mjs escenario 30`.
4. Entra con tu cuenta: Consumo debe mostrar 4 kWh con tres lecturas, y Alertas una anomalía pendiente. Pulsa Resolver.
5. Abre `/invoices/9999` y comprueba que muestra un mensaje de error, no una pantalla en blanco.
6. Cierra sesión y abre `/alerts`: debe llevarte a `/login`.

La prueba completa, con correos y consumo por zona, está en el README del backend.

## Verificación antes de entregar

```powershell
npm run lint
npm run build
```

Ambos deben terminar sin errores.