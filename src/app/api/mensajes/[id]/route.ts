import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mensaje = await prisma.mensaje.findUnique({
      where: { id: parseInt(id) },
    })

    if (!mensaje) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    return NextResponse.json(mensaje)
  } catch (error) {
    console.error('Error fetching mensaje:', error)
    return NextResponse.json({ error: 'Error al obtener mensaje' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const mensaje = await prisma.mensaje.update({
      where: { id: parseInt(id) },
      data: { leido: body.leido },
    })

    return NextResponse.json(mensaje)
  } catch (error) {
    console.error('Error updating mensaje:', error)
    return NextResponse.json({ error: 'Error al actualizar mensaje' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.mensaje.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Mensaje eliminado' })
  } catch (error) {
    console.error('Error deleting mensaje:', error)
    return NextResponse.json({ error: 'Error al eliminar mensaje' }, { status: 500 })
  }
}
