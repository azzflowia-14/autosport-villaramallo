import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatKilometraje } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { GaleriaVehiculo } from '@/components/GaleriaVehiculo'

async function getVehiculo(id: number) {
  return prisma.vehiculo.findUnique({
    where: { id, activo: true },
  })
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

  const estadoColors: Record<string, string> = {
    nuevo: 'bg-green-100 text-green-800',
    usado: 'bg-yellow-100 text-yellow-800',
    certificado: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${estadoColors[vehiculo.estado] || 'bg-gray-100 text-gray-800'}`}>
              {vehiculo.estado}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Kilometraje</p>
                  <p className="font-medium text-white">{formatKilometraje(vehiculo.kilometraje)}</p>
                </div>
              </div>

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
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/cotizar?vehiculo=${vehiculo.id}`} className="flex-1">
              <Button size="lg" className="w-full">
                Solicitar cotización
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
  )
}
