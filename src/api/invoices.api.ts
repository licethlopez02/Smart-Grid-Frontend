import { http } from './http'
import { env } from '../config/env'
import { invoicesMock } from '../mocks/invoices.mock'
import type { FacturaResponse } from './dto'
import type { Invoice, InvoiceStatus } from '../types'

const statusMap: Record<FacturaResponse['estado'], InvoiceStatus> = {
  PENDIENTE: 'pending',
  PAGADA: 'paid',
  VENCIDA: 'overdue',
}

function toInvoice(dto: FacturaResponse): Invoice {
  return {
    id: dto.id,
    meterId: dto.medidorId,
    periodStart: dto.periodoInicio,
    periodEnd: dto.periodoFin,
    totalAmount: dto.montoTotal,
    status: statusMap[dto.estado],
    accumulatedKwh: dto.consumoAcumuladoKwh ?? null,
    appliedTariff: dto.tarifaValor ?? null,
    dueDate: dto.fechaVencimiento ?? null,
  }
}

export async function getInvoicesByMeter(meterId: number): Promise<Invoice[]> {
  const dtos = env.useMocks.invoices
    ? invoicesMock.filter((dto) => dto.medidorId === meterId)
    : (await http.get<FacturaResponse[]>('/api/facturas', { params: { medidorId: meterId } })).data
  return dtos.map(toInvoice).sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))
}

export async function getInvoice(id: number): Promise<Invoice> {
  if (env.useMocks.invoices) {
    const dto = invoicesMock.find((item) => item.id === id)
    if (!dto) throw new Error('Invoice not found')
    return toInvoice(dto)
  }
  const { data } = await http.get<FacturaResponse>(`/api/facturas/${id}`)
  return toInvoice(data)
}
