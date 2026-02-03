import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { MarkAsReadButton } from './MarkAsReadButton'
import { CotizacionesTabs } from './CotizacionesTabs'
import Image from 'next/image'

async function getCotizaciones() {
  return prisma.cotizacion.findMany({
    include: { vehiculo: true },
    orderBy: { createdAt: 'desc' },
  })
}

async function getTasaciones() {
  return prisma.tasacion.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export default async function CotizacionesPage() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const [cotizaciones, tasaciones] = await Promise.all([
    getCotizaciones(),
    getTasaciones(),
  ])

  const pendientesCotizaciones = cotizaciones.filter(c => !c.leida).length
  const pendientesTasaciones = tasaciones.filter(t => !t.leida).length

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Cotizaciones</h1>
        <p className="text-sm lg:text-base text-gray-400">Gestiona las solicitudes de cotización y tasación</p>
      </div>

      <CotizacionesTabs
        pendientesCotizaciones={pendientesCotizaciones}
        pendientesTasaciones={pendientesTasaciones}
      >
        {/* Tab: Cotizaciones de Catálogo */}
        <div data-tab="cotizaciones">
          {/* Vista móvil - Cards */}
          <div className="lg:hidden space-y-4">
            {cotizaciones.length === 0 ? (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-gray-400">
                No hay cotizaciones de catálogo
              </div>
            ) : (
              cotizaciones.map((cotizacion) => (
                <div key={cotizacion.id} className={`bg-dark-800 border border-dark-700 rounded-xl p-4 ${!cotizacion.leida ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-white">{cotizacion.nombre}</p>
                      <p className="text-sm text-gray-400">{cotizacion.email}</p>
                      <p className="text-sm text-gray-400">{cotizacion.telefono}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      cotizacion.leida ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {cotizacion.leida ? 'Leída' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-white">{cotizacion.vehiculo.marca} {cotizacion.vehiculo.modelo}</p>
                    <p className="text-sm text-gray-300">{formatPrice(cotizacion.vehiculo.precio)}</p>
                  </div>
                  {cotizacion.mensaje && (
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{cotizacion.mensaje}</p>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-dark-600">
                    <p className="text-xs text-gray-500">
                      {new Date(cotizacion.createdAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {!cotizacion.leida && (
                      <MarkAsReadButton id={cotizacion.id} type="cotizacion" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden lg:block bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vehículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mensaje</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {cotizaciones.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No hay cotizaciones de catálogo
                      </td>
                    </tr>
                  ) : (
                    cotizaciones.map((cotizacion) => (
                      <tr key={cotizacion.id} className={`hover:bg-dark-700/50 ${!cotizacion.leida ? 'bg-blue-900/20' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{cotizacion.nombre}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-white">{cotizacion.email}</p>
                          <p className="text-sm text-gray-400">{cotizacion.telefono}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">{cotizacion.vehiculo.marca} {cotizacion.vehiculo.modelo}</p>
                          <p className="text-sm text-gray-400">{formatPrice(cotizacion.vehiculo.precio)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300 max-w-xs truncate">
                            {cotizacion.mensaje || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            cotizacion.leida ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {cotizacion.leida ? 'Leída' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(cotizacion.createdAt).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {!cotizacion.leida && (
                            <MarkAsReadButton id={cotizacion.id} type="cotizacion" />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tab: Tasaciones de Usados */}
        <div data-tab="tasaciones">
          {/* Vista móvil y desktop - Cards para tasaciones */}
          <div className="space-y-4">
            {tasaciones.length === 0 ? (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-gray-400">
                No hay solicitudes de tasación
              </div>
            ) : (
              tasaciones.map((tasacion) => {
                const imagenes = JSON.parse(tasacion.imagenes) as string[]
                return (
                  <div key={tasacion.id} className={`bg-dark-800 border border-dark-700 rounded-xl overflow-hidden ${!tasacion.leida ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Fotos */}
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 lg:w-48 lg:flex-shrink-0">
                          {imagenes.slice(0, 4).map((url, idx) => (
                            <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={url}
                                alt={`Foto ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                              {idx === 3 && imagenes.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold">
                                  +{imagenes.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-white">
                                {tasacion.marca} {tasacion.modelo} {tasacion.anio}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {tasacion.kilometraje.toLocaleString('es-AR')} km • {tasacion.combustible} • {tasacion.transmision} • {tasacion.color}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              tasacion.estado === 'pendiente' ? 'bg-yellow-900/50 text-yellow-400' :
                              tasacion.estado === 'cotizado' ? 'bg-green-900/50 text-green-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                              {tasacion.estado === 'pendiente' ? 'Pendiente' :
                               tasacion.estado === 'cotizado' ? 'Cotizado' : 'Rechazado'}
                            </span>
                          </div>

                          {tasacion.descripcion && (
                            <p className="text-sm text-gray-300 mb-3">{tasacion.descripcion}</p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Cliente:</span>{' '}
                              <span className="font-medium text-white">{tasacion.nombre}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span>{' '}
                              <a href={`mailto:${tasacion.email}`} className="text-blue-400 hover:underline">{tasacion.email}</a>
                            </div>
                            <div>
                              <span className="text-gray-500">Tel:</span>{' '}
                              <a href={`tel:${tasacion.telefono}`} className="text-blue-400 hover:underline">{tasacion.telefono}</a>
                            </div>
                          </div>

                          {tasacion.cotizacion && (
                            <div className="mt-3 p-2 bg-green-900/30 rounded-lg inline-block">
                              <span className="text-sm text-green-400">
                                Cotización: <strong>{formatPrice(tasacion.cotizacion)}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-dark-600">
                        <p className="text-xs text-gray-500">
                          {new Date(tasacion.createdAt).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div className="flex gap-2">
                          {!tasacion.leida && (
                            <MarkAsReadButton id={tasacion.id} type="tasacion" />
                          )}
                          <a
                            href={`https://wa.me/${tasacion.telefono.replace(/\D/g, '')}?text=Hola ${tasacion.nombre}, te escribimos de Autosport Emanuel Berdullas por la cotización de tu ${tasacion.marca} ${tasacion.modelo} ${tasacion.anio}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CotizacionesTabs>
    </div>
  )
}
