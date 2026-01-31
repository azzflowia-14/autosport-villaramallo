'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Select } from './ui/Select'
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
    <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Filtros</h2>
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-autosport-red hover:text-autosport-red-light"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Select
          label="Marca"
          options={marcas.map(m => ({ value: m, label: m }))}
          value={searchParams.get('marca') || ''}
          onChange={(e) => handleFilterChange('marca', e.target.value)}
        />

        <Select
          label="Tipo"
          options={tiposVehiculo}
          value={searchParams.get('tipo') || ''}
          onChange={(e) => handleFilterChange('tipo', e.target.value)}
        />

        <Select
          label="Estado"
          options={estadosVehiculo}
          value={searchParams.get('estado') || ''}
          onChange={(e) => handleFilterChange('estado', e.target.value)}
        />

        <Select
          label="Transmisión"
          options={transmisiones}
          value={searchParams.get('transmision') || ''}
          onChange={(e) => handleFilterChange('transmision', e.target.value)}
        />

        <Select
          label="Combustible"
          options={combustibles}
          value={searchParams.get('combustible') || ''}
          onChange={(e) => handleFilterChange('combustible', e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Precio máximo</label>
          <input
            type="number"
            placeholder="Ej: 500000"
            value={precioMax}
            onChange={(e) => {
              setPrecioMax(e.target.value)
              handleInputFilterChange('precioMax', e.target.value)
            }}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-autosport-red transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Año mínimo</label>
          <input
            type="number"
            placeholder="Ej: 2020"
            value={anioMin}
            onChange={(e) => {
              setAnioMin(e.target.value)
              handleInputFilterChange('anioMin', e.target.value)
            }}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-autosport-red transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
