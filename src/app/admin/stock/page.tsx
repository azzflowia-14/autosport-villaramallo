import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StockSpreadsheet from './stock-spreadsheet'

export default async function StockPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const [vehiculos, config] = await Promise.all([
    prisma.vehiculo.findMany({
      orderBy: [{ estadoStock: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.configPrecios.findFirst(),
  ])

  const defaultConfig = config || { descuentoCDO: 15, porcentajeEntrega: 30, tasaX12: 5 }

  return <StockSpreadsheet initialData={vehiculos} config={defaultConfig} />
}
