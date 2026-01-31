import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { MarkAsReadButton } from './MarkAsReadButton'

async function getCotizaciones() {
  return prisma.cotizacion.findMany({
    include: { vehiculo: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function CotizacionesPage() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const cotizaciones = await getCotizaciones()

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Cotizaciones</h1>
        <p className="text-sm lg:text-base text-gray-600">Gestiona las solicitudes de cotización</p>
      </div>

      {/* Vista móvil - Cards */}
      <div className="lg:hidden space-y-4">
        {cotizaciones.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No hay cotizaciones
          </div>
        ) : (
          cotizaciones.map((cotizacion) => (
            <div key={cotizacion.id} className={`bg-white rounded-xl shadow-md p-4 ${!cotizacion.leida ? 'border-l-4 border-blue-500' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{cotizacion.nombre}</p>
                  <p className="text-sm text-gray-500">{cotizacion.email}</p>
                  <p className="text-sm text-gray-500">{cotizacion.telefono}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  cotizacion.leida ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {cotizacion.leida ? 'Leída' : 'Pendiente'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-gray-900">{cotizacion.vehiculo.marca} {cotizacion.vehiculo.modelo}</p>
                <p className="text-sm text-gray-600">{formatPrice(cotizacion.vehiculo.precio)}</p>
              </div>
              {cotizacion.mensaje && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{cotizacion.mensaje}</p>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  {new Date(cotizacion.createdAt).toLocaleDateString('es-MX', {
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
      <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cotizaciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay cotizaciones
                  </td>
                </tr>
              ) : (
                cotizaciones.map((cotizacion) => (
                  <tr key={cotizacion.id} className={`hover:bg-gray-50 ${!cotizacion.leida ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{cotizacion.nombre}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{cotizacion.email}</p>
                      <p className="text-sm text-gray-500">{cotizacion.telefono}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{cotizacion.vehiculo.marca} {cotizacion.vehiculo.modelo}</p>
                      <p className="text-sm text-gray-500">{formatPrice(cotizacion.vehiculo.precio)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {cotizacion.mensaje || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cotizacion.leida ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cotizacion.leida ? 'Leída' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(cotizacion.createdAt).toLocaleDateString('es-MX', {
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
  )
}
