import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { tiposVehiculo, estadosVehiculo, transmisiones, combustibles } from '@/lib/utils'

const vehiculoImportSchema = z.object({
  marca: z.string().min(1, 'Marca es requerida'),
  modelo: z.string().min(1, 'Modelo es requerido'),
  anio: z.number().int().min(1900).max(2100),
  precio: z.number().positive('Precio debe ser mayor a 0'),
  kilometraje: z.number().int().min(0),
  tipo: z.string().refine(val => tiposVehiculo.some(t => t.value === val), {
    message: 'Tipo no válido'
  }),
  estado: z.string().refine(val => estadosVehiculo.some(e => e.value === val), {
    message: 'Estado no válido'
  }),
  color: z.string().min(1, 'Color es requerido'),
  transmision: z.string().refine(val => transmisiones.some(t => t.value === val), {
    message: 'Transmisión no válida'
  }),
  combustible: z.string().refine(val => combustibles.some(c => c.value === val), {
    message: 'Combustible no válido'
  }),
  descripcion: z.string().optional(),
  destacado: z.boolean().optional(),
})

const importSchema = z.object({
  vehiculos: z.array(vehiculoImportSchema).min(1, 'Debe incluir al menos un vehículo'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vehiculos } = importSchema.parse(body)

    const resultados = {
      exitosos: 0,
      errores: [] as { fila: number; error: string }[],
    }

    for (let i = 0; i < vehiculos.length; i++) {
      const vehiculo = vehiculos[i]

      try {
        await prisma.vehiculo.create({
          data: {
            ...vehiculo,
            imagenes: '[]', // Sin imágenes inicialmente
            activo: true,
            destacado: vehiculo.destacado ?? false,
          },
        })
        resultados.exitosos++
      } catch (error) {
        resultados.errores.push({
          fila: i + 2, // +2 porque fila 1 es header y arrays empiezan en 0
          error: error instanceof Error ? error.message : 'Error desconocido',
        })
      }
    }

    return NextResponse.json({
      mensaje: `Se importaron ${resultados.exitosos} de ${vehiculos.length} vehículos`,
      ...resultados,
    }, { status: resultados.errores.length > 0 ? 207 : 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Datos inválidos',
        details: error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message
        }))
      }, { status: 400 })
    }
    console.error('Error importing vehiculos:', error)
    return NextResponse.json({ error: 'Error al importar vehículos' }, { status: 500 })
  }
}
