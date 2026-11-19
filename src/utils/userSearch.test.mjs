/**
 * Pruebas unitarias para filterUsers (src/utils/userSearch.ts)
 * Se ejecutan con Node directamente: node src/utils/userSearch.test.mjs
 */

import { filterUsers } from './__compiled__/utils/userSearch.js'
import assert from 'node:assert/strict'

const USERS = [
  { id: 1, nombre: 'María López', correo: 'maria@example.com', roles: ['USUARIO'], activo: true },
  { id: 2, nombre: 'José García', correo: 'jose@example.com', roles: ['USUARIO'], activo: true },
  { id: 3, nombre: 'Ana Núñez', correo: 'ana.nunez@example.com', roles: ['USUARIO'], activo: true },
  { id: 4, nombre: 'Carlos Pérez', correo: 'carlos@empresa.org', roles: ['USUARIO'], activo: true },
]

// ── query vacía devuelve todos ─────────────────────────────────────────────────
{
  const result = filterUsers(USERS, '')
  assert.equal(result.length, 4, 'query vacía debe devolver todos los usuarios')
}

// ── query con solo espacios devuelve todos ─────────────────────────────────────
{
  const result = filterUsers(USERS, '   ')
  assert.equal(result.length, 4, 'query solo espacios debe devolver todos')
}

// ── filtro por nombre, minúsculas ──────────────────────────────────────────────
{
  const result = filterUsers(USERS, 'maria')
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 1, 'debe encontrar a María con minúsculas')
}

// ── filtro por nombre, mayúsculas ──────────────────────────────────────────────
{
  const result = filterUsers(USERS, 'GARCIA')
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 2, 'debe encontrar a García con mayúsculas')
}

// ── filtro ignorando tildes en la búsqueda ────────────────────────────────────
{
  const result = filterUsers(USERS, 'nunez')   // sin tilde, busca Núñez
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 3, 'debe encontrar a Núñez buscando "nunez" sin tilde')
}

// ── filtro ignorando tildes en el dato del usuario ────────────────────────────
{
  const result = filterUsers(USERS, 'perez')   // sin tilde, busca Pérez
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 4, 'debe encontrar a Pérez buscando "perez" sin tilde')
}

// ── filtro por correo ──────────────────────────────────────────────────────────
{
  const result = filterUsers(USERS, 'empresa.org')
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 4, 'debe encontrar usuario por dominio del correo')
}

// ── filtro por correo, parte del correo ───────────────────────────────────────
{
  const result = filterUsers(USERS, '@example')
  assert.equal(result.length, 3, 'debe devolver los que tienen @example en el correo (3 de 4)')
}

// ── sin resultados ────────────────────────────────────────────────────────────
{
  const result = filterUsers(USERS, 'zzz_no_existe')
  assert.equal(result.length, 0, 'debe devolver array vacío si no hay coincidencias')
}

// ── varios campos: busca fragmento en nombre ──────────────────────────────────
{
  const result = filterUsers(USERS, 'lo')   // 'María López' tiene 'lo' y 'Carlos' también
  assert.ok(result.some((u) => u.id === 1), 'debe incluir a María López (lo en López)')
  assert.ok(result.some((u) => u.id === 4), 'debe incluir a Carlos Pérez (lo en Carlos)')
}

// ── lista vacía ───────────────────────────────────────────────────────────────
{
  const result = filterUsers([], 'maria')
  assert.equal(result.length, 0, 'con lista vacía devuelve array vacío')
}

console.log('✓ Todas las pruebas de filterUsers pasaron.')
