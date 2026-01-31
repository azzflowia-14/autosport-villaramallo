import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const cotizacionSchema = z.object({
  vehiculoId: z.number().int().nullable(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(10, 'Teléfono inválido'),
  mensaje: z.string().optional(),
})

export async function GET() {
  try {
    const cotizaciones = await prisma.cotizacion.findMany({
      include: { vehiculo: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(cotizaciones)
  } catch (error) {
    console.error('Error fetching cotizaciones:', error)
    return NextResponse.json({ error: 'Error al obtener cotizaciones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = cotizacionSchema.parse(body)

    if (data.vehiculoId) {
      const vehiculo = await prisma.vehiculo.findUnique({
        where: { id: data.vehiculoId },
      })
      if (!vehiculo) {
        return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
      }
    }

    const cotizacion = await prisma.cotizacion.create({
      data: {
        vehiculoId: data.vehiculoId || 1, // Default to first vehicle if none specified
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        mensaje: data.mensaje,
      },
    })

    return NextResponse.json(cotizacion, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Error creating cotizacion:', error)
    return NextResponse.json({ error: 'Error al crear cotización' }, { status: 500 })
  }
}
