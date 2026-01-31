import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const vehiculoUpdateSchema = z.object({
  marca: z.string().min(1).optional(),
  modelo: z.string().min(1).optional(),
  anio: z.number().int().min(1900).max(2100).optional(),
  precio: z.number().positive().optional(),
  kilometraje: z.number().int().min(0).optional(),
  tipo: z.string().min(1).optional(),
  estado: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  transmision: z.string().min(1).optional(),
  combustible: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  imagenes: z.string().optional(),
  destacado: z.boolean().optional(),
  activo: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: parseInt(id) },
    })

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    return NextResponse.json(vehiculo)
  } catch (error) {
    console.error('Error fetching vehiculo:', error)
    return NextResponse.json({ error: 'Error al obtener vehículo' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = vehiculoUpdateSchema.parse(body)

    const vehiculo = await prisma.vehiculo.update({
      where: { id: parseInt(id) },
      data,
    })

    return NextResponse.json(vehiculo)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Error updating vehiculo:', error)
    return NextResponse.json({ error: 'Error al actualizar vehículo' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.vehiculo.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Vehículo eliminado' })
  } catch (error) {
    console.error('Error deleting vehiculo:', error)
    return NextResponse.json({ error: 'Error al eliminar vehículo' }, { status: 500 })
  }
}
