import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice, formatKilometraje } from '@/lib/utils'
import { DeleteVehiculoButton } from './DeleteVehiculoButton'

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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-sm lg:text-base text-gray-600">Gestiona el inventario de vehículos</p>
        </div>
        <Link
          href="/admin/vehiculos/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm lg:text-base"
        >
          + Nuevo Vehículo
        </Link>
      </div>

      {/* Vista móvil - Cards */}
      <div className="lg:hidden space-y-4">
        {vehiculos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No hay vehículos registrados
          </div>
        ) : (
          vehiculos.map((vehiculo) => (
            <div key={vehiculo.id} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{vehiculo.marca} {vehiculo.modelo}</p>
                  <p className="text-sm text-gray-500">{vehiculo.anio} - {vehiculo.color}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                    vehiculo.estado === 'nuevo' ? 'bg-green-100 text-green-800' :
                    vehiculo.estado === 'certificado' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vehiculo.estado}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    vehiculo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {vehiculo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-lg font-bold text-gray-900">{formatPrice(vehiculo.precio)}</p>
                <p className="text-sm text-gray-500">{formatKilometraje(vehiculo.kilometraje)}</p>
              </div>
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/vehiculos/${vehiculo.id}`}
                  className="flex-1 text-center py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
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
      <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kilometraje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehiculos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay vehículos registrados
                  </td>
                </tr>
              ) : (
                vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{vehiculo.marca} {vehiculo.modelo}</p>
                        <p className="text-sm text-gray-500">{vehiculo.anio} - {vehiculo.color}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{formatPrice(vehiculo.precio)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{formatKilometraje(vehiculo.kilometraje)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        vehiculo.estado === 'nuevo' ? 'bg-green-100 text-green-800' :
                        vehiculo.estado === 'certificado' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vehiculo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        vehiculo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vehiculo.activo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/vehiculos/${vehiculo.id}`}
                          className="text-blue-600 hover:text-blue-800"
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
