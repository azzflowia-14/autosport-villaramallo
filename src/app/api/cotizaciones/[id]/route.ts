import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: parseInt(id) },
      include: { vehiculo: true },
    })

    if (!cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    return NextResponse.json(cotizacion)
  } catch (error) {
    console.error('Error fetching cotizacion:', error)
    return NextResponse.json({ error: 'Error al obtener cotización' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const cotizacion = await prisma.cotizacion.update({
      where: { id: parseInt(id) },
      data: { leida: body.leida },
    })

    return NextResponse.json(cotizacion)
  } catch (error) {
    console.error('Error updating cotizacion:', error)
    return NextResponse.json({ error: 'Error al actualizar cotización' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.cotizacion.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Cotización eliminada' })
  } catch (error) {
    console.error('Error deleting cotizacion:', error)
    return NextResponse.json({ error: 'Error al eliminar cotización' }, { status: 500 })
  }
}
