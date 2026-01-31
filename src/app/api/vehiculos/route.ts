import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const vehiculoSchema = z.object({
  marca: z.string().min(1),
  modelo: z.string().min(1),
  anio: z.number().int().min(1900).max(2100),
  precio: z.number().positive(),
  kilometraje: z.number().int().min(0),
  tipo: z.string().min(1),
  estado: z.string().min(1),
  color: z.string().min(1),
  transmision: z.string().min(1),
  combustible: z.string().min(1),
  descripcion: z.string().optional(),
  imagenes: z.string(),
  destacado: z.boolean().optional(),
  activo: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const where: Record<string, unknown> = { activo: true }

    if (searchParams.get('marca')) where.marca = searchParams.get('marca')
    if (searchParams.get('tipo')) where.tipo = searchParams.get('tipo')
    if (searchParams.get('estado')) where.estado = searchParams.get('estado')
    if (searchParams.get('transmision')) where.transmision = searchParams.get('transmision')
    if (searchParams.get('combustible')) where.combustible = searchParams.get('combustible')
    if (searchParams.get('precioMax')) where.precio = { lte: parseFloat(searchParams.get('precioMax')!) }
    if (searchParams.get('anioMin')) where.anio = { gte: parseInt(searchParams.get('anioMin')!) }
    if (searchParams.get('destacado') === 'true') where.destacado = true
    if (searchParams.get('all') === 'true') delete where.activo

    const vehiculos = await prisma.vehiculo.findMany({
      where,
      orderBy: [{ destacado: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(vehiculos)
  } catch (error) {
    console.error('Error fetching vehiculos:', error)
    return NextResponse.json({ error: 'Error al obtener vehículos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = vehiculoSchema.parse(body)

    const vehiculo = await prisma.vehiculo.create({
      data,
    })

    return NextResponse.json(vehiculo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Error creating vehiculo:', error)
    return NextResponse.json({ error: 'Error al crear vehículo' }, { status: 500 })
  }
}
