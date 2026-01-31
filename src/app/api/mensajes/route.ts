import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const mensajeSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  asunto: z.string().min(1, 'El asunto es requerido'),
  mensaje: z.string().min(1, 'El mensaje es requerido'),
})

export async function GET() {
  try {
    const mensajes = await prisma.mensaje.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(mensajes)
  } catch (error) {
    console.error('Error fetching mensajes:', error)
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = mensajeSchema.parse(body)

    const mensaje = await prisma.mensaje.create({
      data,
    })

    return NextResponse.json(mensaje, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Error creating mensaje:', error)
    return NextResponse.json({ error: 'Error al crear mensaje' }, { status: 500 })
  }
}
