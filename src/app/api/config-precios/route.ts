import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let config = await prisma.configPrecios.findFirst()
  if (!config) {
    config = await prisma.configPrecios.create({
      data: { descuentoCDO: 15, porcentajeEntrega: 30, tasaX12: 5 },
    })
  }

  return NextResponse.json(config)
}

const updateSchema = z.object({
  descuentoCDO: z.number().min(0).max(100),
  porcentajeEntrega: z.number().min(0).max(100),
  tasaX12: z.number().min(0).max(100),
})

export async function PUT(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    let config = await prisma.configPrecios.findFirst()
    if (config) {
      config = await prisma.configPrecios.update({
        where: { id: config.id },
        data,
      })
    } else {
      config = await prisma.configPrecios.create({ data })
    }

    return NextResponse.json(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    console.error('Error updating config:', error)
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
