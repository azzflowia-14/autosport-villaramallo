import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const estadoSchema = z.object({
  id: z.number().int(),
  estadoStock: z.enum(['disponible', 'reservado', 'en_preparacion', 'vendido']),
  clienteNombre: z.string().optional(),
  clienteTelefono: z.string().optional(),
  montoSena: z.number().min(0).optional(),
  precioVenta: z.number().positive().optional(),
})

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = estadoSchema.parse(body)

    const updateData: Record<string, unknown> = {
      estadoStock: data.estadoStock,
    }

    if (data.estadoStock === 'reservado') {
      if (data.clienteNombre) updateData.clienteNombre = data.clienteNombre
      if (data.clienteTelefono) updateData.clienteTelefono = data.clienteTelefono
      if (data.montoSena) updateData.montoSena = data.montoSena
    }

    if (data.estadoStock === 'vendido') {
      updateData.fechaVenta = new Date()
      updateData.activo = false
      if (data.precioVenta) {
        const usuario = session.user?.email || 'admin'
        const current = await prisma.vehiculo.findUnique({
          where: { id: data.id },
          select: { precio: true },
        })
        if (current && data.precioVenta !== current.precio) {
          await prisma.historialPrecio.create({
            data: {
              vehiculoId: data.id,
              campo: 'precio',
              precioAnterior: current.precio,
              precioNuevo: data.precioVenta,
              usuario,
            },
          })
        }
        updateData.precio = data.precioVenta
      }
    }

    if (data.estadoStock === 'disponible') {
      updateData.fechaVenta = null
      updateData.clienteNombre = null
      updateData.clienteTelefono = null
      updateData.montoSena = null
      updateData.activo = true
    }

    const vehiculo = await prisma.vehiculo.update({
      where: { id: data.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, vehiculo })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Error updating estado:', error)
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
  }
}
