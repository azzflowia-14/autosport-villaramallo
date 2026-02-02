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
        <h1 className="text-xl lg:text-2xl font-bold text-white">Mensajes</h1>
        <p className="text-sm lg:text-base text-gray-400">Gestiona los mensajes de contacto</p>
      </div>

      {/* Vista móvil - Cards */}
      <div className="lg:hidden space-y-4">
        {mensajes.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-gray-400">
            No hay mensajes
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <div key={mensaje.id} className={`bg-dark-800 border border-dark-700 rounded-xl p-4 ${!mensaje.leido ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-white">{mensaje.nombre}</p>
                  <p className="text-sm text-gray-400">{mensaje.email}</p>
                  {mensaje.telefono && <p className="text-sm text-gray-400">{mensaje.telefono}</p>}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  mensaje.leido ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {mensaje.leido ? 'Leído' : 'Pendiente'}
                </span>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-white mb-1">{mensaje.asunto}</p>
                <p className="text-sm text-gray-300 line-clamp-3">{mensaje.mensaje}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dark-600">
                <p className="text-xs text-gray-500">
                  {new Date(mensaje.createdAt).toLocaleDateString('es-AR', {
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
      <div className="hidden lg:block bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Remitente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asunto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mensaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {mensajes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No hay mensajes
                  </td>
                </tr>
              ) : (
                mensajes.map((mensaje) => (
                  <tr key={mensaje.id} className={`hover:bg-dark-700/50 ${!mensaje.leido ? 'bg-blue-900/20' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{mensaje.nombre}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{mensaje.email}</p>
                      <p className="text-sm text-gray-400">{mensaje.telefono || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{mensaje.asunto}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300 max-w-xs truncate">
                        {mensaje.mensaje}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        mensaje.leido ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {mensaje.leido ? 'Leído' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(mensaje.createdAt).toLocaleDateString('es-AR', {
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
