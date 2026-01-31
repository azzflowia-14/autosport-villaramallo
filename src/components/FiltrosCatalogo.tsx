'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect, useRef } from 'react'
import { tiposVehiculo, estadosVehiculo, transmisiones, combustibles, marcas } from '@/lib/utils'

export function FiltrosCatalogo() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Estados locales para los inputs de texto
  const [precioMax, setPrecioMax] = useState(searchParams.get('precioMax') || '')
  const [anioMin, setAnioMin] = useState(searchParams.get('anioMin') || '')

  // Refs para debounce
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sincronizar estados locales con URL cuando cambian los searchParams
  useEffect(() => {
    setPrecioMax(searchParams.get('precioMax') || '')
    setAnioMin(searchParams.get('anioMin') || '')
  }, [searchParams])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (name: string, value: string) => {
    router.push(`/catalogo?${createQueryString(name, value)}`)
  }

  // Filtro con debounce para inputs de texto
  const handleInputFilterChange = (name: string, value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      router.push(`/catalogo?${createQueryString(name, value)}`)
    }, 500)
  }

  const handleClearFilters = () => {
    setPrecioMax('')
    setAnioMin('')
    router.push('/catalogo')
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
      <div className="flex flex-wrap items-end gap-3">
        {/* Marca */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Marca</label>
          <select
            value={searchParams.get('marca') || ''}
            onChange={(e) => handleFilterChange('marca', e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-autosport-red transition-colors"
          >
            <option value="">Todas</option>
            {marcas.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Tipo</label>
          <select
            value={searchParams.get('tipo') || ''}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-autosport-red transition-colors"
          >
            <option value="">Todos</option>
            {tiposVehiculo.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Estado</label>
          <select
            value={searchParams.get('estado') || ''}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-autosport-red transition-colors"
          >
            <option value="">Todos</option>
            {estadosVehiculo.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        {/* Transmisión */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Transmisión</label>
          <select
            value={searchParams.get('transmision') || ''}
            onChange={(e) => handleFilterChange('transmision', e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-autosport-red transition-colors"
          >
            <option value="">Todas</option>
            {transmisiones.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Combustible */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Combustible</label>
          <select
            value={searchParams.get('combustible') || ''}
            onChange={(e) => handleFilterChange('combustible', e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-autosport-red transition-colors"
          >
            <option value="">Todos</option>
            {combustibles.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Año mínimo */}
        <div className="w-[100px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Año mín.</label>
          <input
            type="number"
            placeholder="2020"
            value={anioMin}
            onChange={(e) => {
              setAnioMin(e.target.value)
              handleInputFilterChange('anioMin', e.target.value)
            }}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-autosport-red transition-colors"
          />
        </div>

        {/* Precio máximo */}
        <div className="w-[120px]">
          <label className="block text-xs font-medium text-gray-400 mb-1">Precio máx.</label>
          <input
            type="number"
            placeholder="500000"
            value={precioMax}
            onChange={(e) => {
              setPrecioMax(e.target.value)
              handleInputFilterChange('precioMax', e.target.value)
            }}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-autosport-red transition-colors"
          />
        </div>

        {/* Limpiar filtros */}
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-autosport-red hover:text-white hover:bg-autosport-red rounded-lg border border-autosport-red transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
