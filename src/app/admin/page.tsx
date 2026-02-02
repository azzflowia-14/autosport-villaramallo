import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

async function getStats() {
  const [
    totalVehiculos,
    vehiculosActivos,
    cotizacionesPendientes,
    mensajesPendientes,
    ultimasCotizaciones,
  ] = await Promise.all([
    prisma.vehiculo.count(),
    prisma.vehiculo.count({ where: { activo: true } }),
    prisma.cotizacion.count({ where: { leida: false } }),
    prisma.mensaje.count({ where: { leido: false } }),
    prisma.cotizacion.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { vehiculo: true },
    }),
  ])

  return {
    totalVehiculos,
    vehiculosActivos,
    cotizacionesPendientes,
    mensajesPendientes,
    ultimasCotizaciones,
  }
}

export default async function AdminDashboard() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const stats = await getStats()

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-400">Bienvenido, {session.user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-400">Vehículos Activos</p>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.vehiculosActivos}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-autosport-red/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h2m2 0h8m2-8h3l3 4v4h-2m-4 0H9" />
              </svg>
            </div>
          </div>
          <Link href="/admin/vehiculos" className="text-xs lg:text-sm text-autosport-red hover:underline mt-2 inline-block">
            Ver todos ({stats.totalVehiculos})
          </Link>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-400">Cotizaciones</p>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.cotizacionesPendientes}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Link href="/admin/cotizaciones" className="text-xs lg:text-sm text-autosport-red hover:underline mt-2 inline-block">
            Ver todas
          </Link>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-400">Mensajes</p>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.mensajesPendientes}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <Link href="/admin/mensajes" className="text-xs lg:text-sm text-autosport-red hover:underline mt-2 inline-block">
            Ver todos
          </Link>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 lg:p-6 col-span-2 lg:col-span-1">
          <p className="text-xs lg:text-sm text-gray-400 mb-3">Acciones Rápidas</p>
          <Link
            href="/admin/vehiculos/nuevo"
            className="block w-full bg-autosport-red text-white text-center py-2 rounded-lg hover:bg-autosport-red-dark transition-colors text-sm lg:text-base"
          >
            + Nuevo Vehículo
          </Link>
        </div>
      </div>

      {/* Últimas Cotizaciones */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl">
        <div className="p-4 lg:p-6 border-b border-dark-600">
          <h2 className="text-base lg:text-lg font-semibold text-white">Últimas Cotizaciones</h2>
        </div>

        {/* Vista móvil - Cards */}
        <div className="lg:hidden divide-y divide-dark-600">
          {stats.ultimasCotizaciones.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No hay cotizaciones aún
            </div>
          ) : (
            stats.ultimasCotizaciones.map((cotizacion) => (
              <div key={cotizacion.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-white">{cotizacion.nombre}</p>
                    <p className="text-sm text-gray-400">{cotizacion.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${cotizacion.leida ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {cotizacion.leida ? 'Leída' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-300">{cotizacion.vehiculo.marca} {cotizacion.vehiculo.modelo}</p>
                  <p className="font-medium text-white">{formatPrice(cotizacion.vehiculo.precio)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(cotizacion.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Vista desktop - Tabla */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {stats.ultimasCotizaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No hay cotizaciones aún
                  </td>
                </tr>
              ) : (
                stats.ultimasCotizaciones.map((cotizacion) => (
                  <tr key={cotizacion.id} className="hover:bg-dark-700">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{cotizacion.nombre}</p>
                        <p className="text-sm text-gray-400">{cotizacion.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{cotizacion.vehiculo.marca} {cotizacion.vehiculo.modelo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{formatPrice(cotizacion.vehiculo.precio)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${cotizacion.leida ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {cotizacion.leida ? 'Leída' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(cotizacion.createdAt).toLocaleDateString('es-AR')}
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
