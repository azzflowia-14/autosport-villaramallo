import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const preciosSchema = z.array(
  z.object({
    id: z.number().int(),
    precio: z.number().positive('El precio debe ser mayor a 0'),
  })
)

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const items = preciosSchema.parse(body)

    if (items.length === 0) {
      return NextResponse.json({ error: 'No hay precios para actualizar' }, { status: 400 })
    }

    // Update each price individually (only touches precio field)
    const results = await Promise.all(
      items.map((item) =>
        prisma.vehiculo.update({
          where: { id: item.id },
          data: { precio: item.precio },
          select: { id: true, marca: true, modelo: true, precio: true },
        })
      )
    )

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error actualizando precios:', error)
    return NextResponse.json(
      { error: 'Error al actualizar precios' },
      { status: 500 }
    )
  }
}
