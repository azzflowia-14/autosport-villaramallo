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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bebas tracking-wide text-white mb-1">Catálogo de Vehículos</h1>
        <p className="text-gray-400 text-sm">
          Encontrá el vehículo perfecto entre nuestra selección
        </p>
      </div>

      {/* Filtros arriba */}
      <div className="mb-6">
        <Suspense fallback={<div className="bg-dark-800 p-4 rounded-xl border border-dark-700 animate-pulse h-16" />}>
          <FiltrosCatalogo />
        </Suspense>
      </div>

      {/* Contador */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          {vehiculos.length} {vehiculos.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'}
        </p>
      </div>

      {/* Grid de vehículos - 4 columnas */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {vehiculos.map((vehiculo) => (
            <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
          ))}
        </div>
      )}
    </div>
  )
}
