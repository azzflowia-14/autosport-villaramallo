import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MarkAsReadButton } from '../cotizaciones/MarkAsReadButton'

async function getMensajes() {
  return prisma.mensaje.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export default async function MensajesPage() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  const mensajes = await getMensajes()

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Mensajes</h1>
        <p className="text-sm lg:text-base text-gray-600">Gestiona los mensajes de contacto</p>
      </div>

      {/* Vista móvil - Cards */}
      <div className="lg:hidden space-y-4">
        {mensajes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No hay mensajes
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <div key={mensaje.id} className={`bg-white rounded-xl shadow-md p-4 ${!mensaje.leido ? 'border-l-4 border-blue-500' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{mensaje.nombre}</p>
                  <p className="text-sm text-gray-500">{mensaje.email}</p>
                  {mensaje.telefono && <p className="text-sm text-gray-500">{mensaje.telefono}</p>}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  mensaje.leido ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {mensaje.leido ? 'Leído' : 'Pendiente'}
                </span>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900 mb-1">{mensaje.asunto}</p>
                <p className="text-sm text-gray-600 line-clamp-3">{mensaje.mensaje}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  {new Date(mensaje.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {!mensaje.leido && (
                  <MarkAsReadButton id={mensaje.id} type="mensaje" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remitente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mensajes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay mensajes
                  </td>
                </tr>
              ) : (
                mensajes.map((mensaje) => (
                  <tr key={mensaje.id} className={`hover:bg-gray-50 ${!mensaje.leido ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{mensaje.nombre}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{mensaje.email}</p>
                      <p className="text-sm text-gray-500">{mensaje.telefono || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{mensaje.asunto}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {mensaje.mensaje}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        mensaje.leido ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {mensaje.leido ? 'Leído' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(mensaje.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {!mensaje.leido && (
                        <MarkAsReadButton id={mensaje.id} type="mensaje" />
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
