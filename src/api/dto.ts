// Usuarios
export interface LoginRequest { 
  correo: string; 
  contrasena: string 
}

export interface RegistroRequest { 
  nombre: string; correo: string; 
  contrasena: string 
} // contrasena mínimo 8

export interface TokenResponse { 
  token: string; 
  tipo: string; 
  expiraEnSegundos: number 
}

export interface UsuarioResponse { 
  id: number; 
  nombre: string; 
  correo: string; 
  roles: string[]; 
  activo: boolean 
}

// Medición
export interface LecturaResponse { 
  valor: number; 
  timestamp: string; 
  medidorId: number 
}

export interface ConsumoResponse { 
  consumoAcumulado: number; 
  desde: string; 
  hasta: string 
}

export interface AnomaliaResponse { 
  id: number; 
  valor: number; 
  timestamp: string; 
  razon: string; 
  resuelta: boolean 
}

export interface MedidorResponse { 
  id: number; 
  ubicacion: string; 
  usuarioId: number | null; 
  propiedad: string 
}

// Facturación
export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'VENCIDA'

export interface AnomaliaFacturada { 
  anomaliaId: number; 
  valor: number; 
  momento: string; 
  razon: string 
}

export interface FacturaResponse {
  id: number; medidorId: number; periodoInicio: string; periodoFin: string
  montoTotal: number; estado: EstadoFactura
  consumoAcumuladoKwh: number; tarifaValor: number
  tarifaVigenciaDesde: string; tarifaVigenciaHasta: string
  fechaGeneracion: string; fechaVencimiento: string; fechaPago: string | null
  anomaliasNoResueltas: AnomaliaFacturada[]
}

// Errores (los que genera la aplicación)
export interface ErrorResponse { mensaje: string }