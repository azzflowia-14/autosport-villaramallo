import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

async function getStats() {
  const [
    vehiculos,
    cotizacionesPendientes,
    mensajesPendientes,
    ultimasCotizaciones,
    vehiculosVendidosMes,
  ] = await Promise.all([
    prisma.vehiculo.findMany({
      select: {
        id: true, marca: true, modelo: true, anio: true, precio: true,
        imagenes: true, estadoStock: true, fechaIngreso: true, fechaVenta: true,
        costoCompra: true, precioCDO: true, precioEntrega: true, cuotaX12: true, activo: true,
      },
    }),
    prisma.cotizacion.count({ where: { leida: false } }),
    prisma.mensaje.count({ where: { leido: false } }),
    prisma.cotizacion.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { vehiculo: true },
    }),
    prisma.vehiculo.findMany({
      where: {
        estadoStock: 'vendido',
        fechaVenta: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      select: { id: true, marca: true, modelo: true, precio: true, costoCompra: true, fechaVenta: true },
    }),
  ])

  const enStock = vehiculos.filter(v => v.estadoStock !== 'vendido')
  const disponibles = vehiculos.filter(v => v.estadoStock === 'disponible')
  const reservados = vehiculos.filter(v => v.estadoStock === 'reservado')
  const valorTotal = enStock.reduce((s, v) => s + v.precio, 0)

  // Días promedio
  const now = new Date()
  const diasPromedio = enStock.length > 0
    ? Math.round(enStock.reduce((s, v) => s + Math.floor((now.getTime() - new Date(v.fechaIngreso).getTime()) / 86400000), 0) / enStock.length)
    : 0

  // Alertas
  const sinFotos = enStock.filter(v => {
    try { return JSON.parse(v.imagenes || '[]').length === 0 } catch { return true }
  })
  const sinPrecios = enStock.filter(v => v.precioCDO === null || v.precioEntrega === null || v.cuotaX12 === null)
  const estancados = enStock.filter(v => {
    const dias = Math.floor((now.getTime() - new Date(v.fechaIngreso).getTime()) / 86400000)
    return dias > 45
  })

  // Por marca
  const porMarca: Record<string, number> = {}
  enStock.forEach(v => { porMarca[v.marca] = (porMarca[v.marca] || 0) + 1 })
  const marcasOrdenadas = Object.entries(porMarca).sort((a, b) => b[1] - a[1])
  const maxMarca = marcasOrdenadas[0]?.[1] || 1

  // Ventas del mes
  const ventasMes = vehiculosVendidosMes.length
  const facturacionMes = vehiculosVendidosMes.reduce((s, v) => s + v.precio, 0)

  // Margen promedio (solo vendidos con costo)
  const conCosto = vehiculosVendidosMes.filter(v => v.costoCompra && v.costoCompra > 0)
  const margenPromedio = conCosto.length > 0
    ? conCosto.reduce((s, v) => s + ((v.precio - v.costoCompra!) / v.costoCompra!) * 100, 0) / conCosto.length
    : null

  // Últimos ingresos
  const ultimosIngresos = [...enStock]
    .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
    .slice(0, 5)

  return {
    total: enStock.length,
    disponibles: disponibles.length,
    reservados: reservados.length,
    valorTotal,
    diasPromedio,
    cotizacionesPendientes,
    mensajesPendientes,
    ultimasCotizaciones,
    sinFotos,
    sinPrecios,
    estancados,
    marcasOrdenadas,
    maxMarca,
    ventasMes,
    facturacionMes,
    margenPromedio,
    ultimosIngresos,
    vehiculosVendidosMes,
  }
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const stats = await getStats()

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-400">Bienvenido, {session.user?.name}</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Vehículos en Stock</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs text-green-400">{stats.disponibles} disp.</span>
            <span className="text-xs text-yellow-400">{stats.reservados} res.</span>
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Valor del Inventario</p>
          <p className="text-2xl font-bold text-white">{formatPrice(stats.valorTotal)}</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Días Promedio en Stock</p>
          <p className={`text-2xl font-bold ${stats.diasPromedio > 45 ? 'text-red-400' : stats.diasPromedio > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
            {stats.diasPromedio}
          </p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Ventas del Mes</p>
          <p className="text-2xl font-bold text-white">{stats.ventasMes}</p>
          {stats.facturacionMes > 0 && (
            <p className="text-xs text-green-400 mt-1">{formatPrice(stats.facturacionMes)}</p>
          )}
          {stats.margenPromedio !== null && (
            <p className="text-xs text-gray-500 mt-0.5">Margen: {stats.margenPromedio.toFixed(1)}%</p>
          )}
        </div>
      </div>

      {/* Alertas */}
      {(stats.estancados.length > 0 || stats.sinFotos.length > 0 || stats.sinPrecios.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {stats.estancados.length > 0 && (
            <div className="bg-red-900/20 border border-red-900/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-400">+45 días en stock</p>
              </div>
              <p className="text-xs text-red-300/70">
                {stats.estancados.slice(0, 3).map(v => `${v.marca} ${v.modelo}`).join(', ')}
                {stats.estancados.length > 3 && ` y ${stats.estancados.length - 3} más`}
              </p>
            </div>
          )}
          {stats.sinFotos.length > 0 && (
            <div className="bg-orange-900/20 border border-orange-900/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-orange-400">{stats.sinFotos.length} sin fotos</p>
              </div>
              <p className="text-xs text-orange-300/70">
                {stats.sinFotos.slice(0, 3).map(v => `${v.marca} ${v.modelo}`).join(', ')}
              </p>
            </div>
          )}
          {stats.sinPrecios.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-900/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-yellow-400">{stats.sinPrecios.length} sin CDO/Cuotas</p>
              </div>
              <Link href="/admin/stock" className="text-xs text-yellow-300/70 hover:underline">
                Ir al control de stock →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Row: Por marca + Acciones rápidas + Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Stock por marca */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Stock por Marca</h2>
          <div className="space-y-2">
            {stats.marcasOrdenadas.slice(0, 8).map(([marca, count]) => (
              <div key={marca} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-24 truncate">{marca}</span>
                <div className="flex-1 h-4 bg-dark-700 rounded overflow-hidden">
                  <div className="h-full bg-autosport-red/70 rounded"
                    style={{ width: `${(count / stats.maxMarca) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Acciones Rápidas</h2>
          <div className="space-y-2">
            <Link href="/admin/stock" className="flex items-center gap-3 p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18M3 6h18" />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Control de Stock</span>
            </Link>
            <Link href="/admin/vehiculos/nuevo" className="flex items-center gap-3 p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Nuevo Vehículo</span>
            </Link>
            <Link href="/admin/vehiculos/importar" className="flex items-center gap-3 p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Importar Excel</span>
            </Link>
            <Link href="/admin/stock/kanban" className="flex items-center gap-3 p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <div className="w-8 h-8 bg-autosport-red/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
              </div>
              <span className="text-sm text-gray-300">Vista Kanban</span>
            </Link>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Pendientes</h2>
          <div className="space-y-3">
            <Link href="/admin/cotizaciones" className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-700 transition-colors">
              <span className="text-sm text-gray-300">Cotizaciones</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                stats.cotizacionesPendientes > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-dark-700 text-gray-500'
              }`}>
                {stats.cotizacionesPendientes}
              </span>
            </Link>
            <Link href="/admin/mensajes" className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-700 transition-colors">
              <span className="text-sm text-gray-300">Mensajes</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                stats.mensajesPendientes > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-dark-700 text-gray-500'
              }`}>
                {stats.mensajesPendientes}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row: Últimos ingresos + Últimas ventas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Últimos ingresos */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl">
          <div className="p-4 border-b border-dark-600 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Últimos Ingresos</h2>
            <Link href="/admin/stock" className="text-xs text-autosport-red hover:underline">Ver todo</Link>
          </div>
          <div className="divide-y divide-dark-700">
            {stats.ultimosIngresos.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Sin ingresos recientes</div>
            ) : stats.ultimosIngresos.map(v => {
              let thumb = null
              try { const imgs = JSON.parse(v.imagenes || '[]'); thumb = imgs[0] } catch {}
              return (
                <div key={v.id} className="p-3 flex items-center gap-3">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-12 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-8 bg-dark-700 rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{v.marca} {v.modelo} {v.anio}</p>
                    <p className="text-xs text-gray-500">{new Date(v.fechaIngreso).toLocaleDateString('es-AR')}</p>
                  </div>
                  <p className="text-sm font-medium text-green-400">{formatPrice(v.precio)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ventas del mes */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl">
          <div className="p-4 border-b border-dark-600">
            <h2 className="text-sm font-semibold text-white">Ventas del Mes</h2>
          </div>
          <div className="divide-y divide-dark-700">
            {stats.vehiculosVendidosMes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Sin ventas este mes</div>
            ) : stats.vehiculosVendidosMes.map(v => (
              <div key={v.id} className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{v.marca} {v.modelo}</p>
                  <p className="text-xs text-gray-500">{v.fechaVenta ? new Date(v.fechaVenta).toLocaleDateString('es-AR') : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatPrice(v.precio)}</p>
                  {v.costoCompra && v.costoCompra > 0 && (
                    <p className={`text-xs ${v.precio > v.costoCompra ? 'text-green-400' : 'text-red-400'}`}>
                      {((v.precio - v.costoCompra) / v.costoCompra * 100).toFixed(1)}% margen
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
