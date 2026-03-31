'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice, calcularDiasEnStock } from '@/lib/utils'

interface Vehiculo {
  id: number
  marca: string
  modelo: string
  anio: number
  precio: number
  kilometraje: number
  imagenes: string
  estadoStock: string
  fechaIngreso: string | Date
  clienteNombre: string | null
  clienteTelefono: string | null
  montoSena: number | null
  costoCompra: number | null
}

interface Props {
  initialData: Vehiculo[]
  config: { descuentoCDO: number; porcentajeEntrega: number; tasaX12: number }
}

const colLabels: Record<string, string> = {
  disponible: 'Disponible',
  en_preparacion: 'En Preparación',
  reservado: 'Reservado',
  vendido: 'Vendido',
}
const colColors: Record<string, string> = {
  disponible: 'border-green-500',
  en_preparacion: 'border-blue-500',
  reservado: 'border-yellow-500',
  vendido: 'border-zinc-600',
}

export default function KanbanView({ initialData }: Props) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(initialData)
  const [showReserva, setShowReserva] = useState<number | null>(null)
  const [showVenta, setShowVenta] = useState<number | null>(null)
  const [reservaData, setReservaData] = useState({ clienteNombre: '', clienteTelefono: '', montoSena: '' })
  const [ventaData, setVentaData] = useState({ precioVenta: '' })

  const columnas = ['disponible', 'en_preparacion', 'reservado', 'vendido']

  async function handleDrop(id: number, nuevoEstado: string) {
    const v = vehiculos.find(x => x.id === id)
    if (!v || v.estadoStock === nuevoEstado) return

    if (nuevoEstado === 'reservado') {
      setShowReserva(id)
      return
    }
    if (nuevoEstado === 'vendido') {
      setVentaData({ precioVenta: String(v.precio) })
      setShowVenta(id)
      return
    }

    const res = await fetch('/api/vehiculos/stock-estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estadoStock: nuevoEstado }),
    })
    if (res.ok) {
      const fresh = await fetch('/api/vehiculos?all=true')
      setVehiculos(await fresh.json())
    }
  }

  async function handleReservar() {
    if (!showReserva) return
    const res = await fetch('/api/vehiculos/stock-estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: showReserva,
        estadoStock: 'reservado',
        clienteNombre: reservaData.clienteNombre,
        clienteTelefono: reservaData.clienteTelefono,
        montoSena: reservaData.montoSena ? parseFloat(reservaData.montoSena) : undefined,
      }),
    })
    if (res.ok) {
      const fresh = await fetch('/api/vehiculos?all=true')
      setVehiculos(await fresh.json())
    }
    setShowReserva(null)
    setReservaData({ clienteNombre: '', clienteTelefono: '', montoSena: '' })
  }

  async function handleVender() {
    if (!showVenta) return
    const res = await fetch('/api/vehiculos/stock-estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: showVenta,
        estadoStock: 'vendido',
        precioVenta: ventaData.precioVenta ? parseFloat(ventaData.precioVenta) : undefined,
      }),
    })
    if (res.ok) {
      const fresh = await fetch('/api/vehiculos?all=true')
      setVehiculos(await fresh.json())
    }
    setShowVenta(null)
  }

  const getThumb = (v: Vehiculo) => {
    try {
      const imgs = JSON.parse(v.imagenes || '[]')
      return imgs[0] || null
    } catch { return null }
  }

  const enStock = vehiculos.filter(v => v.estadoStock !== 'vendido').length
  const valorTotal = vehiculos.filter(v => v.estadoStock !== 'vendido').reduce((s, v) => s + v.precio, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Control de Stock — Kanban</h1>
          <p className="text-sm text-gray-400">{enStock} vehículos — {formatPrice(valorTotal)} — Arrastrá para cambiar estado</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/stock" className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600">
            Vista Tabla
          </Link>
          <span className="px-3 py-1.5 text-sm rounded-lg bg-autosport-red text-white">
            Kanban
          </span>
          <Link href="/admin/vehiculos/nuevo" className="px-3 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white">
            + Nuevo
          </Link>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columnas.map(col => {
          const items = vehiculos.filter(v => v.estadoStock === col).sort((a, b) => b.id - a.id)
          return (
            <div key={col}
              className={`bg-dark-800 rounded-xl border-t-2 ${colColors[col]} min-h-[200px] transition-all`}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-blue-500/50') }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-blue-500/50') }}
              onDrop={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-blue-500/50')
                const id = parseInt(e.dataTransfer.getData('vehiculoId'))
                if (id) handleDrop(id, col)
              }}
            >
              <div className="p-3 border-b border-dark-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{colLabels[col]}</h3>
                <span className="text-xs bg-dark-700 text-gray-400 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
                {items.map(v => {
                  const thumb = getThumb(v)
                  const dias = calcularDiasEnStock(v.fechaIngreso)
                  return (
                    <div key={v.id} draggable
                      onDragStart={(e) => { e.dataTransfer.setData('vehiculoId', String(v.id)); e.dataTransfer.effectAllowed = 'move' }}
                      className="bg-dark-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-dark-600 transition-colors group"
                    >
                      <div className="flex gap-3">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-16 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-12 bg-dark-500 rounded flex items-center justify-center text-gray-600 text-xs">Sin foto</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link href={`/admin/vehiculos/${v.id}`} className="text-sm font-medium text-white truncate block hover:text-autosport-red">
                            {v.marca} {v.modelo}
                          </Link>
                          <p className="text-xs text-gray-400">{v.anio} — {v.kilometraje.toLocaleString('es-AR')} km</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-400">{formatPrice(v.precio)}</span>
                        <span className={`text-xs ${dias > 45 ? 'text-red-400' : dias > 30 ? 'text-yellow-400' : 'text-gray-500'}`}>{dias}d</span>
                      </div>
                      {v.clienteNombre && col === 'reservado' && (
                        <div className="mt-1 text-xs text-yellow-400">
                          {v.clienteNombre}
                          {v.montoSena && <span className="text-yellow-600"> — Seña: {formatPrice(v.montoSena)}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <p className="text-center text-gray-600 text-xs py-8">Arrastrá un vehículo aquí</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Reservar */}
      {showReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowReserva(null)}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Reservar Vehículo</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Nombre del cliente" value={reservaData.clienteNombre}
                onChange={e => setReservaData({ ...reservaData, clienteNombre: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
              <input type="tel" placeholder="Teléfono" value={reservaData.clienteTelefono}
                onChange={e => setReservaData({ ...reservaData, clienteTelefono: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Monto de seña ($)" value={reservaData.montoSena}
                onChange={e => setReservaData({ ...reservaData, montoSena: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowReserva(null)} className="px-4 py-2 text-sm text-gray-300 bg-dark-700 rounded-lg hover:bg-dark-600">Cancelar</button>
              <button onClick={handleReservar} className="px-4 py-2 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700">Reservar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vender */}
      {showVenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowVenta(null)}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Registrar Venta</h3>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Precio final de venta</label>
              <input type="number" value={ventaData.precioVenta}
                onChange={e => setVentaData({ precioVenta: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowVenta(null)} className="px-4 py-2 text-sm text-gray-300 bg-dark-700 rounded-lg hover:bg-dark-600">Cancelar</button>
              <button onClick={handleVender} className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">Confirmar Venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
