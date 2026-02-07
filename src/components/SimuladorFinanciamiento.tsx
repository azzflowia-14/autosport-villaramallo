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

// Coeficientes de cuota por cada $1.000.000 financiado
// Vehículos 2021-2026 (tasa más baja)
const COEFICIENTES_NUEVOS: Record<number, number> = {
  6: 0.211485,
  8: 0.169161,
  10: 0.144093,
  12: 0.127653,
  14: 0.116137,
  16: 0.107685,
  18: 0.101283,
  20: 0.096307,
  22: 0.092368,
  24: 0.089189,
  26: 0.086602,
  28: 0.084472,
  30: 0.082703,
  32: 0.081219,
  34: 0.079985,
  36: 0.078935,
}

// Vehículos 2020 y anteriores (tasa más alta)
const COEFICIENTES_USADOS: Record<number, number> = {
  6: 0.219410,
  8: 0.177130,
  10: 0.152205,
  12: 0.135945,
  14: 0.124632,
  16: 0.116391,
  18: 0.110208,
  20: 0.105436,
  22: 0.101700,
  24: 0.098728,
  26: 0.096333,
  28: 0.094387,
  30: 0.092795,
  32: 0.091482,
  34: 0.090400,
  36: 0.089497,
}

const PLAZOS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]

function esSinInteres(plazo: number, anioVehiculo: number): boolean {
  return plazo === 12 && anioVehiculo >= 2015
}

function calcularCuota(monto: number, plazo: number, anioVehiculo: number): number {
  if (esSinInteres(plazo, anioVehiculo)) {
    return Math.round(monto / 12)
  }
  const coeficientes = anioVehiculo >= 2021 ? COEFICIENTES_NUEVOS : COEFICIENTES_USADOS
  const coeficiente = coeficientes[plazo] || 0
  return Math.round(monto * coeficiente)
}

export function SimuladorFinanciamiento() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null)
  const [dineroDisponible, setDineroDisponible] = useState<string>('')
  const [marcaFiltro, setMarcaFiltro] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

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

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    if (showModal) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

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
    if (diferencia > 0 && selectedVehiculo) {
      setShowModal(true)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autosport-red"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Selector de vehículos (más grande) */}
        <div className="lg:col-span-2 bg-dark-800 rounded-xl p-4 border border-dark-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <label className="text-sm font-medium text-gray-300">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-autosport-red text-white text-xs font-bold mr-2">1</span>
              Elegí el auto que querés
            </label>
            <select
              value={marcaFiltro}
              onChange={(e) => {
                setMarcaFiltro(e.target.value)
                if (e.target.value && selectedVehiculo && selectedVehiculo.marca !== e.target.value) {
                  setSelectedVehiculo(null)
                }
              }}
              className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-autosport-red transition-colors"
            >
              <option value="">Todas las marcas</option>
              {marcasUnicas.map((marca) => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {vehiculosFiltrados.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500 text-sm">
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

        {/* Columna derecha: Cálculos */}
        <div className="lg:col-span-1 bg-dark-800 rounded-xl p-4 border border-dark-700 flex flex-col">
          {/* Input dinero */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-autosport-red text-white text-xs font-bold mr-2">2</span>
              ¿Cuánto tenés para entregar?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="text"
                value={dineroDisponible ? parseInt(dineroDisponible).toLocaleString('es-AR') : ''}
                onChange={handleDineroChange}
                placeholder="0"
                className="w-full bg-dark-700 border border-dark-600 rounded-xl py-3 pl-8 pr-4 text-white text-lg font-semibold placeholder-gray-500 focus:outline-none focus:border-autosport-red transition-colors"
              />
            </div>
          </div>

          {/* Resultado */}
          <div className={`bg-dark-900 rounded-xl p-4 mb-4 border border-dark-700 flex-1 ${selectedVehiculo ? 'opacity-100' : 'opacity-50'}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Precio del vehículo</span>
                <span className="text-white font-medium">
                  {selectedVehiculo ? formatPrice(selectedVehiculo.precio) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Tu entrega</span>
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
            className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
              selectedVehiculo && diferencia > 0
                ? 'bg-autosport-red text-white hover:bg-autosport-red-dark'
                : 'bg-dark-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!selectedVehiculo
              ? 'Elegí un vehículo'
              : diferencia <= 0
              ? '¡Tenés el monto completo!'
              : 'Calcular financiación'}
          </button>

          {selectedVehiculo && diferencia > 0 && (
            <p className="text-center text-xs text-gray-500 mt-2">
              Financiación a través de CreditCar
            </p>
          )}
        </div>
      </div>

      {/* Modal de cuotas */}
      {showModal && selectedVehiculo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div className="bg-dark-800 rounded-2xl border border-dark-600 w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-dark-900 px-6 py-4 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Plan de Cuotas</h3>
                  <p className="text-sm text-gray-400">
                    {selectedVehiculo.marca} {selectedVehiculo.modelo} {selectedVehiculo.anio}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Monto a financiar */}
              <div className="mt-4 bg-autosport-red/10 border border-autosport-red/30 rounded-xl p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Monto a financiar:</span>
                  <span className="text-2xl font-bold text-autosport-red">{formatPrice(diferencia)}</span>
                </div>
              </div>

              {/* Info de tasa */}
              <p className="text-xs text-gray-500 mt-2">
                {selectedVehiculo.anio >= 2021
                  ? 'Tasa preferencial para vehículos 2021-2026'
                  : 'Tasa estándar para vehículos 2020 y anteriores'
                }
              </p>
            </div>

            {/* Tabla de cuotas */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-2 gap-3">
                {PLAZOS.map((plazo) => {
                  const cuota = calcularCuota(diferencia, plazo, selectedVehiculo.anio)
                  const total = cuota * plazo
                  const sinInteres = esSinInteres(plazo, selectedVehiculo.anio)
                  return (
                    <div
                      key={plazo}
                      className={`bg-dark-700 border rounded-xl p-4 hover:border-autosport-red/50 transition-colors relative ${
                        sinInteres ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-dark-600'
                      }`}
                    >
                      {sinInteres && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Sin interés
                        </span>
                      )}
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-2xl font-bold text-white">{plazo}</span>
                        <span className="text-xs text-gray-400">cuotas</span>
                      </div>
                      <div className={`text-lg font-bold ${sinInteres ? 'text-green-400' : 'text-autosport-red'}`}>
                        {formatPrice(cuota)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: {formatPrice(total)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-dark-900 px-6 py-4 border-t border-dark-700">
              <p className="text-xs text-gray-500 text-center mb-3">
                Cuotas fijas en pesos. Sujeto a aprobación crediticia.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-dark-600 text-gray-300 hover:bg-dark-700 transition-colors"
                >
                  Cerrar
                </button>
                <a
                  href={`https://wa.me/5493407510895?text=Hola! Quiero consultar por la financiación del ${selectedVehiculo.marca} ${selectedVehiculo.modelo} ${selectedVehiculo.anio}. Monto a financiar: ${formatPrice(diferencia)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Consultar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
