import { env } from '../config/env'

// The backend does not link a user to a meter yet (Medidor only has id + ubicacion).
// When it does (suggested: GET /api/medidores/mio, resolved from the JWT), only this function changes.
export async function getMyMeterId(): Promise<number> {
  return env.devMeterId
}
