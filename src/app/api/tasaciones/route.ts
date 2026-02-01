import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const tasacionSchema = z.object({
  marca: z.string().min(1, 'La marca es requerida'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  anio: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  kilometraje: z.number().int().min(0),
  combustible: z.string().min(1),
  transmision: z.string().min(1),
  color: z.string().min(1),
  descripcion: z.string().optional(),
  imagenes: z.string(), // JSON array de URLs
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono inválido'),
})

// POST - Crear nueva tasación (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = tasacionSchema.parse(body)

    // Validar que haya al menos una imagen
    const imagenes = JSON.parse(data.imagenes)
    if (!Array.isArray(imagenes) || imagenes.length === 0) {
      return NextResponse.json(
        { error: 'Debe subir al menos una foto del vehículo' },
        { status: 400 }
      )
    }

    const tasacion = await prisma.tasacion.create({
      data: {
        ...data,
        estado: 'pendiente',
        leida: false,
      },
    })

    return NextResponse.json(tasacion, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating tasacion:', error)
    return NextResponse.json(
      { error: 'Error al crear la solicitud' },
      { status: 500 }
    )
  }
}

// GET - Listar tasaciones (requiere auth, para admin)
export async function GET() {
  try {
    const tasaciones = await prisma.tasacion.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tasaciones)
  } catch (error) {
    console.error('Error fetching tasaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener tasaciones' },
      { status: 500 }
    )
  }
}
