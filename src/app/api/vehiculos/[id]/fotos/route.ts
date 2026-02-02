import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint para obtener fotos de un vehículo específico
// GET /api/vehiculos/[id]/fotos
// Usado por el chatbot de WhatsApp para enviar fotos

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vehiculoId = parseInt(id)

    if (isNaN(vehiculoId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 })
    }

    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: {
        id: true,
        marca: true,
        modelo: true,
        anio: true,
        imagenes: true,
        activo: true,
      },
    })

    if (!vehiculo) {
      return NextResponse.json({ ok: false, error: 'Vehículo no encontrado' }, { status: 404 })
    }

    let imagenes: string[] = []
    try {
      imagenes = JSON.parse(vehiculo.imagenes || '[]')
    } catch {
      imagenes = []
    }

    return NextResponse.json({
      ok: true,
      vehiculo: {
        id: vehiculo.id,
        nombre: `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}`,
        imagenes: imagenes,
        cantidadFotos: imagenes.length,
      },
    })
  } catch (error) {
    console.error('Error fetching fotos:', error)
    return NextResponse.json({ ok: false, error: 'Error al obtener fotos' }, { status: 500 })
  }
}
