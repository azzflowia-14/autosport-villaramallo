import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { GaleriaVehiculo } from '@/components/GaleriaVehiculo'
import { VehiculoCard } from '@/components/VehiculoCard'
import { NEGOCIO, SITE_URL, waLinkVehiculo } from '@/lib/negocio'

export const dynamic = 'force-dynamic'

const getVehiculo = cache(async (id: number) => {
  if (isNaN(id)) return null
  return prisma.vehiculo.findUnique({
    where: { id, activo: true },
  })
})

function parseImagenes(imagenes: string | null): string[] {
  try {
    const imgs = JSON.parse(imagenes || '[]')
    return Array.isArray(imgs) ? imgs : []
  } catch {
    return []
  }
}

async function getSimilares(vehiculo: { id: number; tipo: string; marca: string }) {
  const similares = await prisma.vehiculo.findMany({
    where: {
      activo: true,
      id: { not: vehiculo.id },
      OR: [{ tipo: vehiculo.tipo }, { marca: vehiculo.marca }],
    },
    orderBy: [{ destacado: 'desc' }, { createdAt: 'desc' }],
    take: 8,
  })
  return similares.filter((v) => parseImagenes(v.imagenes).length > 0).slice(0, 4)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const vehiculo = await getVehiculo(parseInt(id))
  if (!vehiculo) return {}

  const titulo = `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}`
  const descripcion = `${titulo} · ${formatPrice(vehiculo.precio)}. ${NEGOCIO.nombre}, ${NEGOCIO.localidad}.`
  const imagenes = parseImagenes(vehiculo.imagenes)

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: `${titulo} | ${NEGOCIO.nombreCorto}`,
      description: descripcion,
      url: `${SITE_URL}/catalogo/${vehiculo.id}`,
      images: imagenes.length > 0 ? [{ url: imagenes[0], width: 1200, height: 900 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function VehiculoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vehiculo = await getVehiculo(parseInt(id))

  if (!vehiculo) {
    notFound()
  }

  // No mostrar vehículos sin fotos
  const imagenes = parseImagenes(vehiculo.imagenes)
  if (imagenes.length === 0) notFound()

  const similares = await getSimilares(vehiculo)

  const estadoColors: Record<string, string> = {
    nuevo: 'bg-autosport-red text-white',
    usado: 'bg-dark-600 text-gray-200 border border-dark-500',
    certificado: 'bg-green-600 text-white',
  }

  const estadoLabels: Record<string, string> = {
    nuevo: '0KM',
    usado: 'Usado',
    certificado: 'Certificado',
  }

  const jsonLdVehiculo = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}`,
    brand: { '@type': 'Brand', name: vehiculo.marca },
    model: vehiculo.modelo,
    vehicleModelDate: String(vehiculo.anio),
    color: vehiculo.color,
    fuelType: vehiculo.combustible,
    vehicleTransmission: vehiculo.transmision,
    image: imagenes,
    offers: {
      '@type': 'Offer',
      price: vehiculo.precio,
      priceCurrency: 'ARS',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'AutoDealer', name: NEGOCIO.nombre },
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdVehiculo) }}
      />
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li><Link href="/" className="text-gray-400 hover:text-autosport-red">Inicio</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/catalogo" className="text-gray-400 hover:text-autosport-red">Catálogo</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white font-medium">{vehiculo.marca} {vehiculo.modelo}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galería */}
        <GaleriaVehiculo
          imagenes={vehiculo.imagenes}
          marca={vehiculo.marca}
          modelo={vehiculo.modelo}
        />

        {/* Información */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bebas tracking-wide text-white mb-2">
                {vehiculo.marca} {vehiculo.modelo}
              </h1>
              <p className="text-lg text-gray-400">{vehiculo.anio}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${estadoColors[vehiculo.estado] || 'bg-dark-600 text-gray-200'}`}>
              {estadoLabels[vehiculo.estado] || vehiculo.estado}
            </span>
          </div>

          <p className="text-4xl font-bold text-autosport-red mb-6">
            {formatPrice(vehiculo.precio)}
          </p>

          {vehiculo.descripcion && (
            <p className="text-gray-300 mb-8">{vehiculo.descripcion}</p>
          )}

          {/* Especificaciones */}
          <div className="bg-dark-800 rounded-xl p-6 mb-8 border border-dark-700">
            <h2 className="text-lg font-semibold text-white mb-4">Especificaciones</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-autosport-red/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Transmisión</p>
                  <p className="font-medium text-white capitalize">{vehiculo.transmision}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-autosport-red/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Combustible</p>
                  <p className="font-medium text-white capitalize">{vehiculo.combustible}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-autosport-red/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Color</p>
                  <p className="font-medium text-white">{vehiculo.color}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-autosport-red/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tipo</p>
                  <p className="font-medium text-white capitalize">{vehiculo.tipo}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-autosport-red/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Año</p>
                  <p className="font-medium text-white">{vehiculo.anio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            <a
              href={waLinkVehiculo(vehiculo)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-6 py-4 rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Consultar por WhatsApp
            </a>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/cotizar?vehiculo=${vehiculo.id}`} className="flex-1">
                <Button size="lg" className="w-full">
                  Financiación
                </Button>
              </Link>
              <Link href="/contacto" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  Contactar asesor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vehículos similares */}
      {similares.length > 0 && (
        <section className="mt-16 pt-12 border-t border-dark-700">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bebas tracking-wide text-white">
              También te puede interesar
            </h2>
            <Link href="/catalogo" className="text-autosport-red font-semibold hover:text-autosport-red-light transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similares.map((v) => (
              <VehiculoCard key={v.id} vehiculo={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
