import { prisma } from '@/lib/prisma'
import { VehiculoCard } from '@/components/VehiculoCard'
import { FiltrosCatalogo } from '@/components/FiltrosCatalogo'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

interface SearchParams {
  marca?: string
  tipo?: string
  estado?: string
  transmision?: string
  combustible?: string
  precioMax?: string
  anioMin?: string
}

async function getVehiculos(searchParams: SearchParams) {
  const where: Record<string, unknown> = { activo: true }

  if (searchParams.marca) where.marca = searchParams.marca
  if (searchParams.tipo) where.tipo = searchParams.tipo
  if (searchParams.estado) where.estado = searchParams.estado
  if (searchParams.transmision) where.transmision = searchParams.transmision
  if (searchParams.combustible) where.combustible = searchParams.combustible
  if (searchParams.precioMax) where.precio = { lte: parseFloat(searchParams.precioMax) }
  if (searchParams.anioMin) where.anio = { gte: parseInt(searchParams.anioMin) }

  return prisma.vehiculo.findMany({
    where,
    orderBy: [{ destacado: 'desc' }, { createdAt: 'desc' }],
  })
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const vehiculos = await getVehiculos(params)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bebas tracking-wide text-white mb-2">Catálogo de Vehículos</h1>
        <p className="text-gray-400">
          Encuentra el vehículo perfecto para ti entre nuestra amplia selección
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar con filtros */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="bg-dark-800 p-6 rounded-xl border border-dark-700 animate-pulse h-96" />}>
            <FiltrosCatalogo />
          </Suspense>
        </div>

        {/* Grid de vehículos */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-400">
              {vehiculos.length} {vehiculos.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'}
            </p>
          </div>

          {vehiculos.length === 0 ? (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-2">No se encontraron vehículos</h3>
              <p className="text-gray-400">
                Intenta ajustar los filtros para ver más resultados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehiculos.map((vehiculo) => (
                <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
