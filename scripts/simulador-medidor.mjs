// Simulador de medidor inteligente (HU-02): envia lecturas al gateway de forma automatica.
// Requiere Node 18 o superior. No usa dependencias.
//
// Uso:
//   node scripts/simulador-medidor.mjs escenario <medidorId>
//   node scripts/simulador-medidor.mjs continuo  <medidorId> [--cada 5] [--pico 10] [--base 1]
//   node scripts/simulador-medidor.mjs lectura   <medidorId> <valor>
//
// Credenciales (variables de entorno, opcionales). Por defecto usa el operador de desarrollo:
//   SIM_CORREO, SIM_CONTRASENA, SIM_BASE_URL (por defecto http://localhost:8000)

const BASE = process.env.SIM_BASE_URL ?? 'http://localhost:8000';
const CORREO = process.env.SIM_CORREO ?? 'operador@smartgrid.local';
const CONTRASENA = process.env.SIM_CONTRASENA ?? 'Operador123!';

const args = process.argv.slice(2);
const posicionales = [];
const opciones = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    opciones[args[i].slice(2)] = args[i + 1];
    i++;
  } else {
    posicionales.push(args[i]);
  }
}
const [modo, medidorId, valorArg] = posicionales;

function uso() {
  console.log(`Uso:
  node scripts/simulador-medidor.mjs escenario <medidorId>
  node scripts/simulador-medidor.mjs continuo  <medidorId> [--cada 5] [--pico 10] [--base 1]
  node scripts/simulador-medidor.mjs lectura   <medidorId> <valor>`);
  process.exit(1);
}
if (!modo || !medidorId || !['escenario', 'continuo', 'lectura'].includes(modo)) uso();

const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo: CORREO, contrasena: CONTRASENA }),
  });
  if (!r.ok) {
    console.error(`Login fallido (${r.status}). Revisa SIM_CORREO y SIM_CONTRASENA.`);
    process.exit(1);
  }
  return (await r.json()).token;
}

let token = await login();

async function enviar(valor, reintento = true) {
  const timestamp = new Date().toISOString();
  const r = await fetch(`${BASE}/api/medidores/${medidorId}/lecturas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ valor, timestamp }),
  });
  if (r.status === 401 && reintento) {
    token = await login();
    return enviar(valor, false);
  }
  const texto = await r.text();
  console.log(`${timestamp}  valor=${valor}  ->  ${r.status}  ${texto}`);
  return r.ok;
}

if (modo === 'lectura') {
  const valor = Number(valorArg);
  if (Number.isNaN(valor)) uso();
  await enviar(valor);
} else if (modo === 'escenario') {
  // Primera y segunda lectura normales, tercera anomala, cuarta negativa (sensor defectuoso).
  for (const valor of [1, 1, 2, -5]) {
    await enviar(valor);
    await pausa(1500);
  }
  console.log('Escenario terminado.');
} else {
  const cada = Number(opciones.cada ?? 5);
  const pico = Number(opciones.pico ?? 10);
  const base = Number(opciones.base ?? 1);
  console.log(`Enviando al medidor ${medidorId} cada ${cada} s (un pico cada ${pico} lecturas). Ctrl+C para detener.`);
  for (let n = 1; ; n++) {
    const valor = pico > 0 && n % pico === 0 ? base * 3 : base * (0.9 + Math.random() * 0.2);
    await enviar(Number(valor.toFixed(2)));
    await pausa(cada * 1000);
  }
}
