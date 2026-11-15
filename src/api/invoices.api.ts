import axios from 'axios'
import i18n from '../i18n'
import { http } from './http'
import type { FacturaResponse } from './dto'

export async function getMyInvoices(): Promise<FacturaResponse[]> {
  const { data } = await http.get<FacturaResponse[]>('/api/facturas/mias')
  return data
}

export async function getInvoice(id: number): Promise<FacturaResponse> {
  try {
    const { data } = await http.get<FacturaResponse>(`/api/facturas/${id}`)
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMsg = (error.response?.data as { mensaje?: string } | undefined)?.mensaje
      if (error.response?.status === 403) {
        throw new Error(serverMsg || i18n.t('errors.invoiceForbidden'), { cause: error })
      }
      if (error.response?.status === 404 || error.response?.status === 400) {
        throw new Error(serverMsg || i18n.t('errors.invoiceNotFound'), { cause: error })
      }
    }
    throw error
  }
}

export const getInvoices = getMyInvoices
