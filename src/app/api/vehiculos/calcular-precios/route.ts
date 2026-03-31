import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const calcularSchema = z.object({
  descuentoCDO: z.number().min(0).max(100),
  porcentajeEntrega: z.number().min(0).max(100),
  tasaX12: z.number().min(0).max(100),
  soloVacios: z.boolean().default(true), // Solo aplicar a los que no tienen valores
  vehiculoIds: z.array(z.number()).optional(), // Si está vacío, aplica a todos
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const config = calcularSchema.parse(body)
    const usuario = session.user?.email || 'admin'

    const where: Record<string, unknown> = {
      estadoStock: { not: 'vendido' },
    }

    if (config.vehiculoIds && config.vehiculoIds.length > 0) {
      where.id = { in: config.vehiculoIds }
    }

    const vehiculos = await prisma.vehiculo.findMany({
      where,
      select: { id: true, precio: true, precioCDO: true, precioEntrega: true, cuotaX12: true },
    })

    let updated = 0

    for (const v of vehiculos) {
      const newCDO = Math.round(v.precio * (1 - config.descuentoCDO / 100))
      const newEntrega = Math.round(v.precio * (config.porcentajeEntrega / 100))
      const newX12 = Math.round(((v.precio - newEntrega) / 12) * (1 + config.tasaX12 / 100))

      const updateData: Record<string, unknown> = {}
      const historial = []

      if (!config.soloVacios || v.precioCDO === null) {
        if (v.precioCDO !== newCDO) {
          historial.push({ vehiculoId: v.id, campo: 'precioCDO', precioAnterior: v.precioCDO || 0, precioNuevo: newCDO, usuario })
        }
        updateData.precioCDO = newCDO
      }
      if (!config.soloVacios || v.precioEntrega === null) {
        if (v.precioEntrega !== newEntrega) {
          historial.push({ vehiculoId: v.id, campo: 'precioEntrega', precioAnterior: v.precioEntrega || 0, precioNuevo: newEntrega, usuario })
        }
        updateData.precioEntrega = newEntrega
      }
      if (!config.soloVacios || v.cuotaX12 === null) {
        if (v.cuotaX12 !== newX12) {
          historial.push({ vehiculoId: v.id, campo: 'cuotaX12', precioAnterior: v.cuotaX12 || 0, precioNuevo: newX12, usuario })
        }
        updateData.cuotaX12 = newX12
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.$transaction([
          prisma.vehiculo.update({ where: { id: v.id }, data: updateData }),
          ...(historial.length > 0 ? [prisma.historialPrecio.createMany({ data: historial })] : []),
        ])
        updated++
      }
    }

    return NextResponse.json({ success: true, updated, total: vehiculos.length })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Error calculando precios:', error)
    return NextResponse.json({ error: 'Error al calcular precios' }, { status: 500 })
  }
}
