import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const tasacionUpdateSchema = z.object({
  estado: z.string().optional(),
  cotizacion: z.number().optional(),
  notas: z.string().optional(),
  leida: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tasacion = await prisma.tasacion.findUnique({
      where: { id: parseInt(id) },
    })

    if (!tasacion) {
      return NextResponse.json({ error: 'Tasación no encontrada' }, { status: 404 })
    }

    return NextResponse.json(tasacion)
  } catch (error) {
    console.error('Error fetching tasacion:', error)
    return NextResponse.json({ error: 'Error al obtener tasación' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = tasacionUpdateSchema.parse(body)

    const tasacion = await prisma.tasacion.update({
      where: { id: parseInt(id) },
      data,
    })

    return NextResponse.json(tasacion)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Error updating tasacion:', error)
    return NextResponse.json({ error: 'Error al actualizar tasación' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.tasacion.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Tasación eliminada' })
  } catch (error) {
    console.error('Error deleting tasacion:', error)
    return NextResponse.json({ error: 'Error al eliminar tasación' }, { status: 500 })
  }
}
