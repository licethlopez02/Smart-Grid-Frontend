// Usuarios
export interface LoginRequest {
  correo: string
  contrasena: string
}

export interface RegistroRequest {
  nombre: string
  correo: string
  contrasena: string // mínimo 8
}

export interface CambiarContrasenaRequest {
  contrasenaActual: string
  contrasenaNueva: string // mínimo 8
}

export interface ActualizarRolesRequest {
  roles: string[]
}

export interface ActualizarEstadoRequest {
  activo: boolean
}

export interface UsuarioResponse {
  id: number
  nombre: string
  correo: string
  roles: string[]
  activo: boolean
}

export interface TokenResponse {
  token: string
  tipo: string // "Bearer"
  expiraEnSegundos: number
}

// Medición
export interface MedidorRequest {
  id: number
  ubicacion: string
  usuarioId: number | null
  propiedad: string
}

export interface MedidorResponse {
  id: number
  ubicacion: string
  usuarioId: number | null
  propiedad: string
}

export interface LecturaRequest {
  valor: number
  timestamp: string
}

export interface LecturaResponse {
  valor: number
  timestamp: string
  medidorId: number
}

export interface LecturaResultadoResponse {
  esAnomalia: boolean
  razon: string
}

export interface ConsumoResponse {
  consumoAcumulado: number
  desde: string
  hasta: string
}

export interface ConsumoPorZonaResponse {
  zona: string
  consumoAcumulado: number
}

export interface AnomaliaResponse {
  id: number
  valor: number
  timestamp: string
  razon: string
  resuelta: boolean
}

// Facturación
export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'VENCIDA'

export interface TarifaRequest {
  valor: number
  vigenciaDesde: string
  vigenciaHasta: string
}

export interface TarifaResponse {
  id: number
  valor: number
  vigenciaDesde: string
  vigenciaHasta: string
}

export interface FacturaCreacionRequest {
  medidorId: number
  periodoInicio: string // AAAA-MM-DD
  periodoFin: string // AAAA-MM-DD
}

export interface FacturacionMensualResponse {
  mes: string
  generadas: number
  duplicadas: number
  rechazadas: string[]
}

export interface AnomaliaFacturada {
  anomaliaId: number
  valor: number
  momento: string
  razon: string
}

export interface FacturaResponse {
  id: number
  medidorId: number
  periodoInicio: string
  periodoFin: string
  montoTotal: number
  estado: EstadoFactura
  consumoAcumuladoKwh: number
  tarifaValor: number
  tarifaVigenciaDesde: string
  tarifaVigenciaHasta: string
  fechaGeneracion: string
  fechaVencimiento: string
  fechaPago: string | null
  anomaliasNoResueltas: AnomaliaFacturada[]
}

// Errores de la aplicación
export interface ErrorResponse {
  mensaje: string
}
