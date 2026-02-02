import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint público para el chatbot de n8n
// GET /api/vehiculos/stock
// Query params opcionales: marca, tipo, estado, precioMax, anioMin

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const where: Record<string, unknown> = { activo: true }

    if (searchParams.get('marca')) where.marca = { contains: searchParams.get('marca'), mode: 'insensitive' }
    if (searchParams.get('tipo')) where.tipo = searchParams.get('tipo')
    if (searchParams.get('estado')) where.estado = searchParams.get('estado')
    if (searchParams.get('precioMax')) where.precio = { lte: parseFloat(searchParams.get('precioMax')!) }
    if (searchParams.get('anioMin')) where.anio = { gte: parseInt(searchParams.get('anioMin')!) }

    const vehiculos = await prisma.vehiculo.findMany({
      where,
      orderBy: [{ destacado: 'desc' }, { precio: 'asc' }],
      select: {
        id: true,
        marca: true,
        modelo: true,
        anio: true,
        precio: true,
        kilometraje: true,
        tipo: true,
        estado: true,
        color: true,
        transmision: true,
        combustible: true,
        descripcion: true,
        destacado: true,
        imagenes: true,
      },
    })

    // Formato amigable para el AI Agent
    const vehiculosFormateados = vehiculos.map((v) => {
      let imagenes: string[] = []
      try {
        imagenes = JSON.parse(v.imagenes || '[]')
      } catch {
        imagenes = []
      }

      return {
        id: v.id,
        nombre: `${v.marca} ${v.modelo} ${v.anio}`,
        precio: v.precio,
        precioTexto: formatearPrecio(v.precio),
        kilometraje: v.kilometraje,
        kilometrajeTexto: v.kilometraje === 0 ? '0 km (nuevo)' : `${v.kilometraje.toLocaleString('es-AR')} km`,
        tipo: v.tipo,
        estado: v.estado,
        color: v.color,
        transmision: v.transmision,
        combustible: v.combustible,
        descripcion: v.descripcion || '',
        destacado: v.destacado,
        urlDetalle: `https://autosport-villaramallo.vercel.app/catalogo/${v.id}`,
        imagenPrincipal: imagenes[0] || null,
        imagenes: imagenes,
      }
    })

    // Resumen del stock
    const resumen = {
      total: vehiculos.length,
      nuevos: vehiculos.filter((v) => v.estado === 'nuevo').length,
      usados: vehiculos.filter((v) => v.estado === 'usado').length,
      precioMinimo: vehiculos.length > 0 ? formatearPrecio(Math.min(...vehiculos.map((v) => v.precio))) : null,
      precioMaximo: vehiculos.length > 0 ? formatearPrecio(Math.max(...vehiculos.map((v) => v.precio))) : null,
    }

    return NextResponse.json({
      ok: true,
      resumen,
      vehiculos: vehiculosFormateados,
    })
  } catch (error) {
    console.error('Error fetching stock:', error)
    return NextResponse.json({ ok: false, error: 'Error al obtener stock' }, { status: 500 })
  }
}

function formatearPrecio(precio: number): string {
  if (precio >= 1000000) {
    return `$${(precio / 1000000).toFixed(1).replace('.0', '')} millones`
  }
  return `$${precio.toLocaleString('es-AR')}`
}
