'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { formatPrice, formatKilometraje } from '@/lib/utils'

interface Vehiculo {
  id: number
  marca: string
  modelo: string
  anio: number
  precio: number
  kilometraje: number
  estado: string
  activo: boolean
}

export default function PreciosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedPrices, setEditedPrices] = useState<Record<number, number>>({})
  const [savedMsg, setSavedMsg] = useState('')
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const res = await fetch('/api/vehiculos?all=true')
    const data = await res.json()
    setVehiculos(data)
    setEditedPrices({})
    setSavedMsg('')
    setLoading(false)
  }

  function handlePriceChange(id: number, value: string) {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return

    const original = vehiculos.find((v) => v.id === id)
    if (!original) return

    if (num === original.precio) {
      // Remove from edited if back to original
      const next = { ...editedPrices }
      delete next[id]
      setEditedPrices(next)
    } else {
      setEditedPrices({ ...editedPrices, [id]: num })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault()
      const nextId = vehiculos[index + 1]?.id
      if (nextId !== undefined) inputRefs.current[nextId]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevId = vehiculos[index - 1]?.id
      if (prevId !== undefined) inputRefs.current[prevId]?.focus()
    }
  }

  const changedCount = Object.keys(editedPrices).length

  async function handleSave() {
    if (changedCount === 0) return

    setSaving(true)
    setSavedMsg('')

    const items = Object.entries(editedPrices).map(([id, precio]) => ({
      id: Number(id),
      precio,
    }))

    try {
      const res = await fetch('/api/vehiculos/precios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })

      if (res.ok) {
        const data = await res.json()
        setSavedMsg(`${data.updated} precio(s) actualizado(s)`)
        // Reload to get fresh data
        await loadData()
      } else {
        const err = await res.json()
        setSavedMsg(`Error: ${err.error}`)
      }
    } catch {
      setSavedMsg('Error de conexion')
    }

    setSaving(false)
  }

  function handleDiscardAll() {
    setEditedPrices({})
    setSavedMsg('')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            Editor de Precios
          </h1>
          <p className="text-sm lg:text-base text-gray-400">
            Modifica precios sin tocar fotos ni otros datos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && (
            <span
              className={`text-sm ${savedMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}
            >
              {savedMsg}
            </span>
          )}
          {changedCount > 0 && (
            <button
              onClick={handleDiscardAll}
              className="border border-zinc-600 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={changedCount === 0 || saving}
            className={`px-4 py-2 rounded-lg text-white text-sm lg:text-base transition-colors ${
              changedCount > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-zinc-700 cursor-not-allowed text-zinc-500'
            }`}
          >
            {saving
              ? 'Guardando...'
              : changedCount > 0
                ? `Guardar ${changedCount} cambio${changedCount > 1 ? 's' : ''}`
                : 'Sin cambios'}
          </button>
          <Link
            href="/admin/vehiculos"
            className="border border-zinc-600 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
          >
            Volver
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-gray-400">
          Cargando vehiculos...
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-gray-400">
          No hay vehiculos registrados
        </div>
      ) : (
        <>
          {/* Mobile view - Cards */}
          <div className="lg:hidden space-y-3">
            {vehiculos.map((v, index) => {
              const isEdited = v.id in editedPrices
              const currentPrice = isEdited ? editedPrices[v.id] : v.precio
              return (
                <div
                  key={v.id}
                  className={`bg-dark-800 border rounded-xl p-4 transition-colors ${
                    isEdited
                      ? 'border-blue-500 bg-blue-900/10'
                      : 'border-dark-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-white">
                        {v.marca} {v.modelo}
                      </p>
                      <p className="text-sm text-gray-400">
                        {v.anio} - {formatKilometraje(v.kilometraje)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        v.activo
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}
                    >
                      {v.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm shrink-0">$</span>
                    <input
                      ref={(el) => { inputRefs.current[v.id] = el }}
                      type="number"
                      value={currentPrice}
                      onChange={(e) => handlePriceChange(v.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`w-full bg-dark-700 border rounded-lg px-3 py-2 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEdited ? 'border-blue-500' : 'border-dark-600'
                      }`}
                    />
                  </div>
                  {isEdited && (
                    <p className="text-xs text-gray-500 mt-1">
                      Antes: {formatPrice(v.precio)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden lg:block bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Vehiculo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Km
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Precio actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-64">
                    Nuevo precio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {vehiculos.map((v, index) => {
                  const isEdited = v.id in editedPrices
                  return (
                    <tr
                      key={v.id}
                      className={`transition-colors ${
                        isEdited
                          ? 'bg-blue-900/20'
                          : 'hover:bg-dark-700/50'
                      }`}
                    >
                      <td className="px-6 py-3">
                        <p className="font-medium text-white">
                          {v.marca} {v.modelo}
                        </p>
                      </td>
                      <td className="px-6 py-3 text-gray-300">{v.anio}</td>
                      <td className="px-6 py-3 text-gray-300">
                        {formatKilometraje(v.kilometraje)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            v.estado === 'nuevo'
                              ? 'bg-green-900/50 text-green-400'
                              : v.estado === 'certificado'
                                ? 'bg-blue-900/50 text-blue-400'
                                : 'bg-yellow-900/50 text-yellow-400'
                          }`}
                        >
                          {v.estado}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <p
                          className={`font-medium ${isEdited ? 'text-gray-500 line-through' : 'text-white'}`}
                        >
                          {formatPrice(v.precio)}
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">$</span>
                          <input
                            ref={(el) => { inputRefs.current[v.id] = el }}
                            type="number"
                            value={
                              isEdited ? editedPrices[v.id] : v.precio
                            }
                            onChange={(e) =>
                              handlePriceChange(v.id, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`w-full bg-dark-700 border rounded-lg px-3 py-1.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              isEdited
                                ? 'border-blue-500'
                                : 'border-dark-600'
                            }`}
                          />
                          {isEdited && (
                            <span className="text-blue-400 text-xs shrink-0">
                              {editedPrices[v.id] > v.precio ? '↑' : '↓'}
                              {Math.abs(
                                Math.round(
                                  ((editedPrices[v.id] - v.precio) /
                                    v.precio) *
                                    100
                                )
                              )}
                              %
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Sticky save bar when there are changes */}
          {changedCount > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-600 p-4 flex items-center justify-center gap-4 z-50 lg:left-64">
              <span className="text-gray-300 text-sm">
                {changedCount} precio{changedCount > 1 ? 's' : ''}{' '}
                modificado{changedCount > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleDiscardAll}
                className="border border-zinc-600 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
              >
                Descartar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
