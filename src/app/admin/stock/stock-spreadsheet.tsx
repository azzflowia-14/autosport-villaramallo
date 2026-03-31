'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { formatPrice, calcularDiasEnStock, estadosStock } from '@/lib/utils'

interface Vehiculo {
  id: number
  marca: string
  modelo: string
  anio: number
  precio: number
  kilometraje: number
  tipo: string
  estado: string
  color: string
  transmision: string
  combustible: string
  imagenes: string
  activo: boolean
  destacado: boolean
  precioCDO: number | null
  precioEntrega: number | null
  cuotaX12: number | null
  costoCompra: number | null
  estadoStock: string
  fechaIngreso: string | Date
  fechaVenta: string | Date | null
  patente: string | null
  observaciones: string | null
  clienteNombre: string | null
  clienteTelefono: string | null
  montoSena: number | null
}

interface ConfigPrecios {
  descuentoCDO: number
  porcentajeEntrega: number
  tasaX12: number
}

type EditedFields = Record<number, Record<string, unknown>>

const EDITABLE_COLUMNS = ['precio', 'precioCDO', 'precioEntrega', 'cuotaX12', 'kilometraje', 'costoCompra', 'patente'] as const

interface Props {
  initialData: Vehiculo[]
  config: ConfigPrecios
}

export default function StockSpreadsheet({ initialData, config }: Props) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(initialData)
  const [editedFields, setEditedFields] = useState<EditedFields>({})
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [filterMarca, setFilterMarca] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [sortBy, setSortBy] = useState<string>('default')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showAjuste, setShowAjuste] = useState(false)
  const [ajustePorcentaje, setAjustePorcentaje] = useState('')
  const [showAutoCalc, setShowAutoCalc] = useState(false)
  const [showReservaModal, setShowReservaModal] = useState<number | null>(null)
  const [showVentaModal, setShowVentaModal] = useState<number | null>(null)
  const [reservaData, setReservaData] = useState({ clienteNombre: '', clienteTelefono: '', montoSena: '' })
  const [ventaData, setVentaData] = useState({ precioVenta: '' })
  const [view, setView] = useState<'tabla' | 'kanban'>('tabla')

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Filter and sort
  const filtered = vehiculos.filter(v => {
    if (filterMarca && v.marca !== filterMarca) return false
    if (filterEstado && v.estadoStock !== filterEstado) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'default') {
      const order = ['disponible', 'en_preparacion', 'reservado', 'vendido']
      const diff = order.indexOf(a.estadoStock) - order.indexOf(b.estadoStock)
      return diff !== 0 ? diff : b.id - a.id
    }
    let va: number | string = 0, vb: number | string = 0
    if (sortBy === 'precio') { va = a.precio; vb = b.precio }
    else if (sortBy === 'anio') { va = a.anio; vb = b.anio }
    else if (sortBy === 'marca') { va = a.marca; vb = b.marca }
    else if (sortBy === 'dias') { va = calcularDiasEnStock(a.fechaIngreso); vb = calcularDiasEnStock(b.fechaIngreso) }
    else if (sortBy === 'km') { va = a.kilometraje; vb = b.kilometraje }

    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
    return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const sortIcon = (col: string) => {
    if (sortBy !== col) return '↕'
    return sortDir === 'asc' ? '↑' : '↓'
  }

  // Edit handling
  function handleFieldChange(id: number, field: string, value: string) {
    const original = vehiculos.find(v => v.id === id)
    if (!original) return

    let parsed: unknown
    if (['precio', 'precioCDO', 'precioEntrega', 'cuotaX12', 'costoCompra', 'kilometraje'].includes(field)) {
      if (value === '' || value === '-') { parsed = null }
      else {
        const num = parseFloat(value)
        if (isNaN(num)) return
        parsed = num
      }
    } else {
      parsed = value || null
    }

    const originalVal = original[field as keyof Vehiculo]
    const current = { ...editedFields }

    if (parsed === originalVal || (parsed === null && originalVal === null)) {
      // Back to original - remove edit
      if (current[id]) {
        delete current[id][field]
        if (Object.keys(current[id]).length === 0) delete current[id]
      }
    } else {
      if (!current[id]) current[id] = {}
      current[id][field] = parsed

      // Auto-calculate CDO/Entrega/X12 when precio changes
      if (field === 'precio' && parsed !== null) {
        const precio = parsed as number
        const newCDO = Math.round(precio * (1 - config.descuentoCDO / 100))
        const newEntrega = Math.round(precio * (config.porcentajeEntrega / 100))
        const newX12 = Math.round(((precio - newEntrega) / 12) * (1 + config.tasaX12 / 100))

        // Only auto-fill if currently null or already auto-calculated
        if (original.precioCDO === null || current[id]?.precioCDO !== undefined) {
          current[id].precioCDO = newCDO
        }
        if (original.precioEntrega === null || current[id]?.precioEntrega !== undefined) {
          current[id].precioEntrega = newEntrega
        }
        if (original.cuotaX12 === null || current[id]?.cuotaX12 !== undefined) {
          current[id].cuotaX12 = newX12
        }
      }
    }

    setEditedFields({ ...current })
  }

  function getFieldValue(v: Vehiculo, field: string): string {
    if (editedFields[v.id] && field in editedFields[v.id]) {
      const val = editedFields[v.id][field]
      return val === null ? '' : String(val)
    }
    const val = v[field as keyof Vehiculo]
    return val === null || val === undefined ? '' : String(val)
  }

  function isFieldEdited(id: number, field: string): boolean {
    return !!(editedFields[id] && field in editedFields[id])
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent, rowIndex: number, colIndex: number) {
    const row = sorted[rowIndex]
    if (!row) return
    const cols = EDITABLE_COLUMNS

    if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault()
      // Move to next editable column, or next row
      let nextCol = colIndex + 1
      let nextRow = rowIndex
      if (nextCol >= cols.length) {
        nextCol = 0
        nextRow++
      }
      if (nextRow < sorted.length) {
        const key = `${sorted[nextRow].id}-${cols[nextCol]}`
        inputRefs.current[key]?.focus()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextRow = sorted[rowIndex + 1]
      if (nextRow) inputRefs.current[`${nextRow.id}-${cols[colIndex]}`]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevRow = sorted[rowIndex - 1]
      if (prevRow) inputRefs.current[`${prevRow.id}-${cols[colIndex]}`]?.focus()
    } else if (e.key === 'Escape') {
      // Discard this field
      const current = { ...editedFields }
      if (current[row.id]) {
        delete current[row.id][cols[colIndex]]
        if (Object.keys(current[row.id]).length === 0) delete current[row.id]
      }
      setEditedFields(current)
    }
  }

  // Selection
  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sorted.map(v => v.id)))
    }
  }

  // Batch save
  const changedCount = Object.keys(editedFields).length

  async function handleSave() {
    if (changedCount === 0) return
    setSaving(true)
    setSavedMsg('')

    const items = Object.entries(editedFields).map(([id, fields]) => ({
      id: Number(id),
      ...fields,
    }))

    try {
      const res = await fetch('/api/vehiculos/stock-batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })

      if (res.ok) {
        const data = await res.json()
        setSavedMsg(`${data.updated} vehículo(s) actualizado(s)`)
        // Refresh data
        const fresh = await fetch('/api/vehiculos?all=true')
        const freshData = await fresh.json()
        setVehiculos(freshData)
        setEditedFields({})
        setTimeout(() => setSavedMsg(''), 3000)
      } else {
        const err = await res.json()
        setSavedMsg(`Error: ${err.error}`)
      }
    } catch {
      setSavedMsg('Error de conexión')
    }
    setSaving(false)
  }

  // Ajuste masivo
  async function handleAjusteMasivo() {
    const pct = parseFloat(ajustePorcentaje)
    if (isNaN(pct) || pct === 0) return

    const targets = selectedIds.size > 0
      ? sorted.filter(v => selectedIds.has(v.id))
      : sorted.filter(v => v.estadoStock !== 'vendido')

    const newEdits = { ...editedFields }
    for (const v of targets) {
      const currentPrecio = editedFields[v.id]?.precio as number ?? v.precio
      const newPrecio = Math.round(currentPrecio * (1 + pct / 100))
      if (!newEdits[v.id]) newEdits[v.id] = {}
      newEdits[v.id].precio = newPrecio

      // Recalculate
      const newCDO = Math.round(newPrecio * (1 - config.descuentoCDO / 100))
      const newEntrega = Math.round(newPrecio * (config.porcentajeEntrega / 100))
      const newX12 = Math.round(((newPrecio - newEntrega) / 12) * (1 + config.tasaX12 / 100))
      newEdits[v.id].precioCDO = newCDO
      newEdits[v.id].precioEntrega = newEntrega
      newEdits[v.id].cuotaX12 = newX12
    }

    setEditedFields(newEdits)
    setShowAjuste(false)
    setAjustePorcentaje('')
  }

  // Auto-cálculo masivo
  async function handleAutoCalc(soloVacios: boolean) {
    const targets = selectedIds.size > 0
      ? sorted.filter(v => selectedIds.has(v.id))
      : sorted.filter(v => v.estadoStock !== 'vendido')

    const newEdits = { ...editedFields }
    for (const v of targets) {
      const precio = (editedFields[v.id]?.precio as number) ?? v.precio
      const newCDO = Math.round(precio * (1 - config.descuentoCDO / 100))
      const newEntrega = Math.round(precio * (config.porcentajeEntrega / 100))
      const newX12 = Math.round(((precio - newEntrega) / 12) * (1 + config.tasaX12 / 100))

      if (!newEdits[v.id]) newEdits[v.id] = {}

      if (!soloVacios || v.precioCDO === null) newEdits[v.id].precioCDO = newCDO
      if (!soloVacios || v.precioEntrega === null) newEdits[v.id].precioEntrega = newEntrega
      if (!soloVacios || v.cuotaX12 === null) newEdits[v.id].cuotaX12 = newX12
    }

    setEditedFields(newEdits)
    setShowAutoCalc(false)
  }

  // Estado change handlers
  async function handleEstadoChange(id: number, nuevoEstado: string) {
    if (nuevoEstado === 'reservado') {
      setShowReservaModal(id)
      return
    }
    if (nuevoEstado === 'vendido') {
      const v = vehiculos.find(x => x.id === id)
      if (v) setVentaData({ precioVenta: String(v.precio) })
      setShowVentaModal(id)
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
      setSavedMsg('Estado actualizado')
      setTimeout(() => setSavedMsg(''), 2000)
    }
  }

  async function handleReservar() {
    if (!showReservaModal) return
    const res = await fetch('/api/vehiculos/stock-estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: showReservaModal,
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
    setShowReservaModal(null)
    setReservaData({ clienteNombre: '', clienteTelefono: '', montoSena: '' })
  }

  async function handleVender() {
    if (!showVentaModal) return
    const res = await fetch('/api/vehiculos/stock-estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: showVentaModal,
        estadoStock: 'vendido',
        precioVenta: ventaData.precioVenta ? parseFloat(ventaData.precioVenta) : undefined,
      }),
    })
    if (res.ok) {
      const fresh = await fetch('/api/vehiculos?all=true')
      setVehiculos(await fresh.json())
    }
    setShowVentaModal(null)
    setVentaData({ precioVenta: '' })
  }

  // Stats
  const stats = {
    total: vehiculos.filter(v => v.estadoStock !== 'vendido').length,
    disponibles: vehiculos.filter(v => v.estadoStock === 'disponible').length,
    reservados: vehiculos.filter(v => v.estadoStock === 'reservado').length,
    valorTotal: vehiculos.filter(v => v.estadoStock !== 'vendido').reduce((s, v) => s + v.precio, 0),
    sinPrecios: vehiculos.filter(v => v.estadoStock !== 'vendido' && (v.precioCDO === null || v.precioEntrega === null || v.cuotaX12 === null)).length,
  }

  const estadoBadge = (estado: string) => {
    const e = estadosStock.find(x => x.value === estado)
    const colors: Record<string, string> = {
      green: 'bg-green-900/50 text-green-400',
      yellow: 'bg-yellow-900/50 text-yellow-400',
      blue: 'bg-blue-900/50 text-blue-400',
      gray: 'bg-zinc-800 text-zinc-400',
    }
    return colors[e?.color || 'gray']
  }

  const getThumb = (v: Vehiculo) => {
    try {
      const imgs = JSON.parse(v.imagenes || '[]')
      return imgs[0] || null
    } catch { return null }
  }

  const margenPct = (v: Vehiculo) => {
    if (!v.costoCompra || v.costoCompra === 0) return null
    return ((v.precio - v.costoCompra) / v.costoCompra * 100).toFixed(1)
  }

  // ==================== KANBAN VIEW ====================
  if (view === 'kanban') {
    const columnas = ['disponible', 'en_preparacion', 'reservado', 'vendido']
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

    return (
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white">Control de Stock</h1>
            <p className="text-sm text-gray-400">{stats.total} vehículos en stock — {formatPrice(stats.valorTotal)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('tabla')} className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600">
              Tabla
            </button>
            <button className="px-3 py-1.5 text-sm rounded-lg bg-autosport-red text-white">
              Kanban
            </button>
            <Link href="/admin/vehiculos/nuevo" className="px-3 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white">
              + Nuevo
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columnas.map(col => {
            const items = vehiculos.filter(v => v.estadoStock === col).sort((a, b) => b.id - a.id)
            return (
              <div key={col} className={`bg-dark-800 rounded-xl border-t-2 ${colColors[col]} min-h-[200px]`}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-blue-500') }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-blue-500') }}
                onDrop={async (e) => {
                  e.currentTarget.classList.remove('ring-2', 'ring-blue-500')
                  const id = parseInt(e.dataTransfer.getData('vehiculoId'))
                  if (id && col !== vehiculos.find(v => v.id === id)?.estadoStock) {
                    await handleEstadoChange(id, col)
                  }
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
                        onDragStart={(e) => { e.dataTransfer.setData('vehiculoId', String(v.id)) }}
                        className="bg-dark-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-dark-600 transition-colors"
                      >
                        <div className="flex gap-3">
                          {thumb ? (
                            <img src={thumb} alt="" className="w-16 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-12 bg-dark-500 rounded flex items-center justify-center text-gray-600 text-xs">Sin foto</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{v.marca} {v.modelo}</p>
                            <p className="text-xs text-gray-400">{v.anio} — {v.kilometraje.toLocaleString('es-AR')} km</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-green-400">{formatPrice(v.precio)}</span>
                          <span className={`text-xs ${dias > 45 ? 'text-red-400' : 'text-gray-500'}`}>{dias}d</span>
                        </div>
                        {v.clienteNombre && col === 'reservado' && (
                          <p className="text-xs text-yellow-400 mt-1">Cliente: {v.clienteNombre}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ==================== TABLE VIEW ====================
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white">Control de Stock</h1>
            <p className="text-sm text-gray-400">Editá directamente en la tabla — Tab para avanzar, Enter para bajar</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {savedMsg && (
              <span className={`text-sm ${savedMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {savedMsg}
              </span>
            )}
            <button onClick={() => setView('tabla')} className="px-3 py-1.5 text-sm rounded-lg bg-autosport-red text-white">
              Tabla
            </button>
            <button onClick={() => setView('kanban')} className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600">
              Kanban
            </button>
            <Link href="/admin/vehiculos/nuevo" className="px-3 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white">
              + Nuevo
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">En Stock</p>
            <p className="text-lg font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">Disponibles</p>
            <p className="text-lg font-bold text-green-400">{stats.disponibles}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">Reservados</p>
            <p className="text-lg font-bold text-yellow-400">{stats.reservados}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">Valor Total</p>
            <p className="text-lg font-bold text-white">{formatPrice(stats.valorTotal)}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">Sin Precios</p>
            <p className={`text-lg font-bold ${stats.sinPrecios > 0 ? 'text-orange-400' : 'text-green-400'}`}>{stats.sinPrecios}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <select value={filterMarca} onChange={e => setFilterMarca(e.target.value)}
            className="bg-dark-700 border border-dark-600 text-gray-300 text-sm rounded-lg px-3 py-1.5">
            <option value="">Todas las marcas</option>
            {Array.from(new Set(vehiculos.map(v => v.marca))).sort().map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            className="bg-dark-700 border border-dark-600 text-gray-300 text-sm rounded-lg px-3 py-1.5">
            <option value="">Todos los estados</option>
            {estadosStock.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-dark-600 hidden sm:block" />

          <button onClick={() => setShowAjuste(true)}
            className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 border border-dark-600 text-gray-300 hover:bg-dark-600">
            % Ajuste Masivo
          </button>
          <button onClick={() => setShowAutoCalc(true)}
            className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 border border-dark-600 text-gray-300 hover:bg-dark-600">
            Calcular CDO/Cuotas
          </button>

          {selectedIds.size > 0 && (
            <span className="text-xs text-blue-400">{selectedIds.size} seleccionados</span>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {sorted.map((v) => {
          const dias = calcularDiasEnStock(v.fechaIngreso)
          const thumb = getThumb(v)
          return (
            <div key={v.id} className={`bg-dark-800 border rounded-xl p-4 ${
              editedFields[v.id] ? 'border-blue-500 bg-blue-900/10' : 'border-dark-700'
            }`}>
              <div className="flex gap-3 mb-3">
                {thumb ? (
                  <img src={thumb} alt="" className="w-20 h-14 object-cover rounded" />
                ) : (
                  <div className="w-20 h-14 bg-dark-700 rounded flex items-center justify-center text-gray-600 text-xs">Sin foto</div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-white">{v.marca} {v.modelo}</p>
                  <p className="text-sm text-gray-400">{v.anio} — {v.kilometraje.toLocaleString('es-AR')} km</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${estadoBadge(v.estadoStock)}`}>
                      {estadosStock.find(e => e.value === v.estadoStock)?.label}
                    </span>
                    <span className={`text-xs ${dias > 45 ? 'text-red-400' : 'text-gray-500'}`}>{dias} días</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['precio', 'precioCDO', 'precioEntrega', 'cuotaX12'] as const).map(field => (
                  <div key={field}>
                    <label className="text-xs text-gray-500">
                      {field === 'precio' ? 'Lista' : field === 'precioCDO' ? 'Contado' : field === 'precioEntrega' ? 'Entrega' : 'x12'}
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">$</span>
                      <input
                        type="number"
                        value={getFieldValue(v, field)}
                        onChange={e => handleFieldChange(v.id, field, e.target.value)}
                        placeholder="-"
                        className={`w-full bg-dark-700 border rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isFieldEdited(v.id, field) ? 'border-blue-500' : 'border-dark-600'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Estado selector */}
              <div className="mt-2">
                <select value={v.estadoStock} onChange={e => handleEstadoChange(v.id, e.target.value)}
                  className="w-full bg-dark-700 border border-dark-600 text-gray-300 text-sm rounded px-2 py-1">
                  {estadosStock.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-700 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 w-8">
                  <input type="checkbox" checked={selectedIds.size === sorted.length && sorted.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-dark-500 bg-dark-600 text-blue-500" />
                </th>
                <th className="px-2 py-2 w-12"></th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-white"
                  onClick={() => handleSort('marca')}>
                  Vehículo {sortIcon('marca')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-white w-16"
                  onClick={() => handleSort('anio')}>
                  Año {sortIcon('anio')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-white"
                  onClick={() => handleSort('km')}>
                  KM {sortIcon('km')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-white"
                  onClick={() => handleSort('precio')}>
                  Precio Lista {sortIcon('precio')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">CDO</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Entrega</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">x12</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Costo</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Patente</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Estado</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-white"
                  onClick={() => handleSort('dias')}>
                  Días {sortIcon('dias')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {sorted.map((v, rowIndex) => {
                const isEdited = !!editedFields[v.id]
                const dias = calcularDiasEnStock(v.fechaIngreso)
                const thumb = getThumb(v)
                const margen = margenPct(v)

                return (
                  <tr key={v.id} className={`transition-colors ${
                    isEdited ? 'bg-blue-900/15' : 'hover:bg-dark-700/50'
                  } ${v.estadoStock === 'vendido' ? 'opacity-50' : ''}`}>
                    <td className="px-2 py-1.5">
                      <input type="checkbox" checked={selectedIds.has(v.id)}
                        onChange={() => toggleSelect(v.id)}
                        className="rounded border-dark-500 bg-dark-600 text-blue-500" />
                    </td>
                    <td className="px-2 py-1.5">
                      {thumb ? (
                        <img src={thumb} alt="" className="w-10 h-7 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-7 bg-dark-600 rounded" />
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <Link href={`/admin/vehiculos/${v.id}`} className="font-medium text-white hover:text-autosport-red transition-colors">
                        {v.marca} {v.modelo}
                      </Link>
                    </td>
                    <td className="px-3 py-1.5 text-gray-300">{v.anio}</td>
                    {/* KM - editable */}
                    <td className="px-1 py-1">
                      <input
                        ref={el => { inputRefs.current[`${v.id}-kilometraje`] = el }}
                        type="number"
                        value={getFieldValue(v, 'kilometraje')}
                        onChange={e => handleFieldChange(v.id, 'kilometraje', e.target.value)}
                        onKeyDown={e => handleKeyDown(e, rowIndex, 4)}
                        className={`w-24 bg-transparent border rounded px-2 py-0.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right ${
                          isFieldEdited(v.id, 'kilometraje') ? 'border-blue-500 text-white' : 'border-transparent hover:border-dark-600'
                        }`}
                      />
                    </td>
                    {/* Precio Lista */}
                    <td className="px-1 py-1">
                      <input
                        ref={el => { inputRefs.current[`${v.id}-precio`] = el }}
                        type="number"
                        value={getFieldValue(v, 'precio')}
                        onChange={e => handleFieldChange(v.id, 'precio', e.target.value)}
                        onKeyDown={e => handleKeyDown(e, rowIndex, 0)}
                        className={`w-32 bg-transparent border rounded px-2 py-0.5 text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 text-right ${
                          isFieldEdited(v.id, 'precio') ? 'border-blue-500' : 'border-transparent hover:border-dark-600'
                        }`}
                      />
                    </td>
                    {/* CDO */}
                    <td className="px-1 py-1">
                      <input
                        ref={el => { inputRefs.current[`${v.id}-precioCDO`] = el }}
                        type="number"
                        value={getFieldValue(v, 'precioCDO')}
                        onChange={e => handleFieldChange(v.id, 'precioCDO', e.target.value)}
                        onKeyDown={e => handleKeyDown(e, rowIndex, 1)}
                        placeholder="-"
                        className={`w-28 bg-transparent border rounded px-2 py-0.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right ${
                          isFieldEdited(v.id, 'precioCDO') ? 'border-blue-500 text-white' : 'border-transparent hover:border-dark-600'
                        }`}
                      />
                    </td>
                    {/* Entrega */}
                    <td className="px-1 py-1">
                      <input
                        ref={el => { inputRefs.current[`${v.id}-precioEntrega`] = el }}
                        type="number"
                        value={getFieldValue(v, 'precioEntrega')}
                        onChange={e => handleFieldChange(v.id, 'precioEntrega', e.target.value)}
                        onKeyDown={e => handleKeyDown(e, rowIndex, 2)}
                        placeholder="-"
                        className={`w-28 bg-transparent border rounded px-2 py-0.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right ${
                          isFieldEdited(v.id, 'precioEntrega') ? 'border-blue-500 text-white' : 'border-transparent hover:border-dark-600'
                        }`}
                      />
                    </td>
                    {/* x12 */}
                    <td className="px-1 py-1">
                      <input
                        ref={el => { inputRefs.current[`${v.id}-cuotaX12`] = el }}
                        type="number"
                        value={getFieldValue(v, 'cuotaX12')}
                        onChange={e => handleFieldChange(v.id, 'cuotaX12', e.target.value)}
                        onKeyDown={e => handleKeyDown(e, rowIndex, 3)}
                        placeholder="-"
                        className={`w-24 bg-transparent border rounded px-2 py-0.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right ${
                          isFieldEdited(v.id, 'cuotaX12') ? 'border-blue-500 text-white' : 'border-transparent hover:border-dark-600'
                        }`}
                      />
                    </td>
                    {/* Costo */}
                    <td className="px-1 py-1">
                      <input
                        ref={el => { inputRefs.current[`${v.id}-costoCompra`] = el }}
                        type="number"
                        value={getFieldValue(v, 'costoCompra')}
                        onChange={e => handleFieldChange(v.id, 'costoCompra', e.target.value)}
                        onKeyDown={e => handleKeyDown(e, rowIndex, 5)}
                        placeholder="-"
                        className={`w-28 bg-transparent border rounded px-2 py-0.5 text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right ${
                          isFieldEdited(v.id, 'costoCompra') ? 'border-blue-500 text-white' : 'border-transparent hover:border-dark-600'
                        }`}
                      />
                    </td>
                    {/* Patente */}
                    <td className="px-1 py-1">
                      <input
                        ref={el => { inputRefs.current[`${v.id}-patente`] = el }}
                        type="text"
                        value={getFieldValue(v, 'patente')}
                        onChange={e => handleFieldChange(v.id, 'patente', e.target.value)}
                        onKeyDown={e => handleKeyDown(e, rowIndex, 6)}
                        placeholder="-"
                        className={`w-20 bg-transparent border rounded px-2 py-0.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase ${
                          isFieldEdited(v.id, 'patente') ? 'border-blue-500 text-white' : 'border-transparent hover:border-dark-600'
                        }`}
                      />
                    </td>
                    {/* Estado */}
                    <td className="px-2 py-1.5">
                      <select value={v.estadoStock} onChange={e => handleEstadoChange(v.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${estadoBadge(v.estadoStock)} bg-opacity-100`}>
                        {estadosStock.map(e => (
                          <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                      </select>
                    </td>
                    {/* Días */}
                    <td className="px-3 py-1.5">
                      <span className={`text-sm font-medium ${
                        dias > 60 ? 'text-red-400' : dias > 30 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {dias}d
                      </span>
                    </td>
                    {/* Margen */}
                    <td className="px-3 py-1.5">
                      {margen ? (
                        <span className={`text-sm font-medium ${
                          parseFloat(margen) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {margen}%
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {changedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-blue-500/30 p-3 flex items-center justify-center gap-4 z-50 lg:left-64 backdrop-blur-sm bg-dark-800/95">
          <span className="text-gray-300 text-sm">
            {changedCount} vehículo{changedCount > 1 ? 's' : ''} modificado{changedCount > 1 ? 's' : ''}
          </span>
          <button onClick={() => { setEditedFields({}); setSavedMsg('') }}
            className="border border-zinc-600 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-sm">
            Descartar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}

      {/* Modal: Ajuste Masivo */}
      {showAjuste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowAjuste(false)}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Ajuste Masivo de Precios</h3>
            <p className="text-sm text-gray-400 mb-4">
              {selectedIds.size > 0
                ? `Aplicar a ${selectedIds.size} vehículo(s) seleccionado(s)`
                : `Aplicar a ${sorted.filter(v => v.estadoStock !== 'vendido').length} vehículo(s) en stock`}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input type="number" value={ajustePorcentaje} onChange={e => setAjustePorcentaje(e.target.value)}
                placeholder="Ej: 5 para subir 5%"
                className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus />
              <span className="text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Usá valores negativos para bajar (ej: -10)</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAjuste(false)}
                className="px-4 py-2 text-sm text-gray-300 bg-dark-700 rounded-lg hover:bg-dark-600">
                Cancelar
              </button>
              <button onClick={handleAjusteMasivo}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Auto-Cálculo */}
      {showAutoCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowAutoCalc(false)}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">Calcular CDO / Entrega / Cuotas</h3>
            <div className="space-y-2 mb-4 text-sm text-gray-400">
              <p>CDO = Lista - {config.descuentoCDO}%</p>
              <p>Entrega = Lista × {config.porcentajeEntrega}%</p>
              <p>x12 = (Lista - Entrega) / 12 × (1 + {config.tasaX12}%)</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              <Link href="/admin/stock/configuracion" className="text-blue-400 hover:underline">Cambiar fórmulas</Link>
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleAutoCalc(true)}
                className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Solo llenar vacíos
              </button>
              <button onClick={() => handleAutoCalc(false)}
                className="w-full px-4 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700">
                Recalcular todos
              </button>
              <button onClick={() => setShowAutoCalc(false)}
                className="w-full px-4 py-2 text-sm text-gray-300 bg-dark-700 rounded-lg hover:bg-dark-600">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reservar */}
      {showReservaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowReservaModal(null)}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Reservar Vehículo</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Nombre del cliente" value={reservaData.clienteNombre}
                onChange={e => setReservaData({ ...reservaData, clienteNombre: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus />
              <input type="tel" placeholder="Teléfono" value={reservaData.clienteTelefono}
                onChange={e => setReservaData({ ...reservaData, clienteTelefono: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Monto de seña ($)" value={reservaData.montoSena}
                onChange={e => setReservaData({ ...reservaData, montoSena: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowReservaModal(null)}
                className="px-4 py-2 text-sm text-gray-300 bg-dark-700 rounded-lg hover:bg-dark-600">
                Cancelar
              </button>
              <button onClick={handleReservar}
                className="px-4 py-2 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700">
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vender */}
      {showVentaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowVentaModal(null)}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Registrar Venta</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Precio final de venta</label>
                <input type="number" value={ventaData.precioVenta}
                  onChange={e => setVentaData({ precioVenta: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowVentaModal(null)}
                className="px-4 py-2 text-sm text-gray-300 bg-dark-700 rounded-lg hover:bg-dark-600">
                Cancelar
              </button>
              <button onClick={handleVender}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
