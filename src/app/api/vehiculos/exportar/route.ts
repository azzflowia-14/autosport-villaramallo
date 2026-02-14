import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const vehiculos = await prisma.vehiculo.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const headers = ['ID', 'Marca', 'Modelo', 'Año', 'Precio', 'Kilometraje', 'Tipo', 'Estado', 'Color', 'Transmision', 'Combustible', 'Destacado', 'Activo']

  const rows = vehiculos.map((v) => [
    v.id,
    v.marca,
    v.modelo,
    v.anio,
    v.precio,
    v.kilometraje,
    v.tipo,
    v.estado,
    v.color,
    v.transmision,
    v.combustible,
    v.destacado ? 'Sí' : 'No',
    v.activo ? 'Sí' : 'No',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        const str = String(cell ?? '')
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(',')
    ),
  ].join('\n')

  // BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF'

  return new NextResponse(bom + csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="stock-vehiculos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
