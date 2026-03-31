import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import KanbanView from './kanban-view'

export default async function KanbanPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const [vehiculos, config] = await Promise.all([
    prisma.vehiculo.findMany({
      orderBy: [{ estadoStock: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.configPrecios.findFirst(),
  ])

  const defaultConfig = config || { descuentoCDO: 15, porcentajeEntrega: 30, tasaX12: 5 }

  return <KanbanView initialData={vehiculos} config={defaultConfig} />
}
