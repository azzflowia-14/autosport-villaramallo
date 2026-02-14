import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice, formatKilometraje } from '@/lib/utils'
import { DeleteVehiculoButton } from './DeleteVehiculoButton'
import { ExportarCSVButton } from './ExportarCSVButton'

async function getVehiculos() {
  return prisma.vehiculo.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export default async function VehiculosPage() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const vehiculos = await getVehiculos()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Vehículos</h1>
          <p className="text-sm lg:text-base text-gray-400">Gestiona el inventario de vehículos</p>
        </div>
        <div className="flex gap-2">
          <ExportarCSVButton />
          <Link
            href="/admin/vehiculos/importar"
            className="border border-zinc-600 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-center text-sm lg:text-base"
          >
            Importar Excel
          </Link>
          <Link
            href="/admin/vehiculos/nuevo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm lg:text-base"
          >
            + Nuevo Vehículo
          </Link>
        </div>
      </div>

      {/* Vista móvil - Cards */}
      <div className="lg:hidden space-y-4">
        {vehiculos.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-gray-400">
            No hay vehículos registrados
          </div>
        ) : (
          vehiculos.map((vehiculo) => (
            <div key={vehiculo.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-white">{vehiculo.marca} {vehiculo.modelo}</p>
                  <p className="text-sm text-gray-400">{vehiculo.anio} - {vehiculo.color}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                    vehiculo.estado === 'nuevo' ? 'bg-green-900/50 text-green-400' :
                    vehiculo.estado === 'certificado' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-yellow-900/50 text-yellow-400'
                  }`}>
                    {vehiculo.estado}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    vehiculo.activo ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {vehiculo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-lg font-bold text-white">{formatPrice(vehiculo.precio)}</p>
                <p className="text-sm text-gray-400">{formatKilometraje(vehiculo.kilometraje)}</p>
              </div>
              <div className="flex gap-3 pt-3 border-t border-dark-600">
                <Link
                  href={`/admin/vehiculos/${vehiculo.id}`}
                  className="flex-1 text-center py-2 text-sm text-blue-400 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors"
                >
                  Editar
                </Link>
                <div className="flex-1">
                  <DeleteVehiculoButton id={vehiculo.id} />
                </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kilometraje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {vehiculos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No hay vehículos registrados
                  </td>
                </tr>
              ) : (
                vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id} className="hover:bg-dark-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{vehiculo.marca} {vehiculo.modelo}</p>
                        <p className="text-sm text-gray-400">{vehiculo.anio} - {vehiculo.color}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{formatPrice(vehiculo.precio)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{formatKilometraje(vehiculo.kilometraje)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        vehiculo.estado === 'nuevo' ? 'bg-green-900/50 text-green-400' :
                        vehiculo.estado === 'certificado' ? 'bg-blue-900/50 text-blue-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {vehiculo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        vehiculo.activo ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        {vehiculo.activo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/vehiculos/${vehiculo.id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Editar
                        </Link>
                        <DeleteVehiculoButton id={vehiculo.id} />
                      </div>
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
