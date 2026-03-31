import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const batchUpdateSchema = z.array(
  z.object({
    id: z.number().int(),
    precio: z.number().positive().optional(),
    precioCDO: z.number().positive().nullable().optional(),
    precioEntrega: z.number().min(0).nullable().optional(),
    cuotaX12: z.number().positive().nullable().optional(),
    costoCompra: z.number().min(0).nullable().optional(),
    kilometraje: z.number().int().min(0).optional(),
    estadoStock: z.enum(['disponible', 'reservado', 'en_preparacion', 'vendido']).optional(),
    patente: z.string().nullable().optional(),
    observaciones: z.string().nullable().optional(),
    activo: z.boolean().optional(),
  })
)

const PRICE_FIELDS = ['precio', 'precioCDO', 'precioEntrega', 'cuotaX12'] as const

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const items = batchUpdateSchema.parse(body)

    if (items.length === 0) {
      return NextResponse.json({ error: 'No hay cambios' }, { status: 400 })
    }

    const usuario = session.user?.email || 'admin'
    let updated = 0

    for (const item of items) {
      const { id, ...data } = item

      // Get current values for price history
      const current = await prisma.vehiculo.findUnique({
        where: { id },
        select: { precio: true, precioCDO: true, precioEntrega: true, cuotaX12: true },
      })

      if (!current) continue

      // Record price changes in history
      const historialEntries = []
      for (const field of PRICE_FIELDS) {
        if (field in data && data[field as keyof typeof data] !== undefined) {
          const oldVal = current[field as keyof typeof current]
          const newVal = data[field as keyof typeof data] as number | null
          if (oldVal !== newVal && newVal !== undefined) {
            historialEntries.push({
              vehiculoId: id,
              campo: field,
              precioAnterior: (oldVal as number) || 0,
              precioNuevo: (newVal as number) || 0,
              usuario,
            })
          }
        }
      }

      // Handle selling: set fechaVenta
      const updateData: Record<string, unknown> = { ...data }
      const estado = data.estadoStock as string | undefined
      if (estado === 'vendido') {
        updateData.fechaVenta = new Date()
        updateData.activo = false
      } else if (estado) {
        updateData.fechaVenta = null
      }

      await prisma.$transaction([
        prisma.vehiculo.update({ where: { id }, data: updateData }),
        ...(historialEntries.length > 0
          ? [prisma.historialPrecio.createMany({ data: historialEntries })]
          : []),
      ])

      updated++
    }

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Error batch update:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
