'use client'

import { useState, useEffect, useMemo } from 'react'
import { formatPrice } from '@/lib/utils'

interface Vehiculo {
  id: number
  marca: string
  modelo: string
  anio: number
  precio: number
  imagenes: string
}

export function SimuladorFinanciamiento() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null)
  const [dineroDisponible, setDineroDisponible] = useState<string>('')
  const [marcaFiltro, setMarcaFiltro] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const response = await fetch('/api/vehiculos')
        if (response.ok) {
          const data = await response.json()
          setVehiculos(data.filter((v: Vehiculo & { activo: boolean }) => v.activo))
        }
      } catch (error) {
        console.error('Error fetching vehiculos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVehiculos()
  }, [])

  // Obtener marcas únicas
  const marcasUnicas = useMemo(() => {
    const marcas = Array.from(new Set(vehiculos.map(v => v.marca)))
    return marcas.sort()
  }, [vehiculos])

  // Filtrar vehículos por marca
  const vehiculosFiltrados = useMemo(() => {
    if (!marcaFiltro) return vehiculos
    return vehiculos.filter(v => v.marca === marcaFiltro)
  }, [vehiculos, marcaFiltro])

  const dineroNum = parseFloat(dineroDisponible.replace(/[^0-9]/g, '')) || 0
  const diferencia = selectedVehiculo ? Math.max(0, selectedVehiculo.precio - dineroNum) : 0

  const handleDineroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setDineroDisponible(value)
  }

  const getImageUrl = (vehiculo: Vehiculo) => {
    try {
      const imagenes = JSON.parse(vehiculo.imagenes || '[]')
      return imagenes[0] || '/placeholder-car.svg'
    } catch {
      return '/placeholder-car.svg'
    }
  }

  const handleCotizar = () => {
    if (diferencia > 0) {
      window.open(`https://cotizador.creditcar.com.ar/`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-dark-800 rounded-2xl p-6 lg:p-8 border border-dark-700">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autosport-red"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-2xl p-6 lg:p-8 border border-dark-700">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Columna izquierda: Elegir vehículo */}
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <label className="text-sm font-medium text-gray-300">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-autosport-red text-white text-xs font-bold mr-2">1</span>
              Elegí el auto que querés
            </label>

            {/* Filtro por marca */}
            <select
              value={marcaFiltro}
              onChange={(e) => {
                setMarcaFiltro(e.target.value)
                // Si el vehículo seleccionado no es de la marca filtrada, deseleccionar
                if (e.target.value && selectedVehiculo && selectedVehiculo.marca !== e.target.value) {
                  setSelectedVehiculo(null)
                }
              }}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-autosport-red transition-colors"
            >
              <option value="">Todas las marcas</option>
              {marcasUnicas.map((marca) => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
            {vehiculosFiltrados.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No hay vehículos disponibles
              </div>
            ) : (
              vehiculosFiltrados.map((vehiculo) => (
                <button
                  key={vehiculo.id}
                  onClick={() => setSelectedVehiculo(vehiculo)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedVehiculo?.id === vehiculo.id
                      ? 'border-autosport-red bg-autosport-red/10'
                      : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                  }`}
                >
                  <div className="w-16 h-12 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getImageUrl(vehiculo)}
                      alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-car.svg'
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm truncate">
                      {vehiculo.marca} {vehiculo.modelo}
                    </p>
                    <p className="text-xs text-gray-400">{vehiculo.anio}</p>
                    <p className="text-autosport-red font-semibold text-sm">
                      {formatPrice(vehiculo.precio)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Columna derecha: Cálculo */}
        <div className="lg:col-span-2">
          {/* Input dinero */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-autosport-red text-white text-xs font-bold mr-2">2</span>
              ¿Cuánto tenés para entregar?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="text"
                value={dineroDisponible ? parseInt(dineroDisponible).toLocaleString('es-AR') : ''}
                onChange={handleDineroChange}
                placeholder="0"
                className="w-full bg-dark-700 border border-dark-600 rounded-xl py-4 pl-8 pr-4 text-white text-xl font-semibold placeholder-gray-500 focus:outline-none focus:border-autosport-red transition-colors"
              />
            </div>
          </div>

          {/* Resultado */}
          <div className={`bg-dark-900 rounded-xl p-5 mb-5 border border-dark-700 transition-opacity ${selectedVehiculo ? 'opacity-100' : 'opacity-50'}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>Precio del vehículo</span>
                <span className="text-white font-medium">
                  {selectedVehiculo ? formatPrice(selectedVehiculo.precio) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>Tu entrega</span>
                <span className="text-green-400 font-medium">- {formatPrice(dineroNum)}</span>
              </div>
              <div className="border-t border-dark-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">A financiar</span>
                  <span className="text-2xl font-bold text-autosport-red">
                    {selectedVehiculo ? formatPrice(diferencia) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón cotizar */}
          <button
            onClick={handleCotizar}
            disabled={!selectedVehiculo || diferencia <= 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              selectedVehiculo && diferencia > 0
                ? 'bg-autosport-red text-white hover:bg-autosport-red-dark'
                : 'bg-dark-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!selectedVehiculo
              ? 'Elegí un vehículo'
              : diferencia <= 0
              ? '¡Tenés el monto completo!'
              : `Cotizar ${formatPrice(diferencia)} en cuotas`}
          </button>

          {selectedVehiculo && diferencia > 0 && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Serás redirigido al cotizador de CreditCar
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
