'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatPrice, formatKilometraje } from '@/lib/utils'
import { DeleteVehiculoButton } from './DeleteVehiculoButton'

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
  destacado: boolean
  activo: boolean
  createdAt: string
}

type SortKey = 'reciente' | 'az' | 'za' | 'precio-desc' | 'precio-asc' | 'anio-desc' | 'anio-asc'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'reciente', label: 'Recientes' },
  { key: 'az', label: 'A → Z' },
  { key: 'za', label: 'Z → A' },
  { key: 'precio-desc', label: 'Precio ↓' },
  { key: 'precio-asc', label: 'Precio ↑' },
  { key: 'anio-desc', label: 'Año ↓' },
  { key: 'anio-asc', label: 'Año ↑' },
]

function sortVehiculos(vehiculos: Vehiculo[], key: SortKey): Vehiculo[] {
  const sorted = [...vehiculos]
  switch (key) {
    case 'az':
      return sorted.sort((a, b) =>
        `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`)
      )
    case 'za':
      return sorted.sort((a, b) =>
        `${b.marca} ${b.modelo}`.localeCompare(`${a.marca} ${a.modelo}`)
      )
    case 'precio-desc':
      return sorted.sort((a, b) => b.precio - a.precio)
    case 'precio-asc':
      return sorted.sort((a, b) => a.precio - b.precio)
    case 'anio-desc':
      return sorted.sort((a, b) => b.anio - a.anio)
    case 'anio-asc':
      return sorted.sort((a, b) => a.anio - b.anio)
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}

function tieneImagenes(v: Vehiculo): boolean {
  try {
    const imgs = JSON.parse(v.imagenes || '[]')
    return Array.isArray(imgs) && imgs.length > 0
  } catch {
    return false
  }
}

type FiltroFoto = 'todos' | 'sin-foto' | 'con-foto'

export function VehiculosList({ vehiculos, search: initialSearch }: { vehiculos: Vehiculo[]; search?: string }) {
  const [sortKey, setSortKey] = useState<SortKey>('reciente')
  const [search, setSearch] = useState(initialSearch || '')
  const [filtroFoto, setFiltroFoto] = useState<FiltroFoto>('todos')

  const sinFotoCount = useMemo(() => vehiculos.filter(v => !tieneImagenes(v)).length, [vehiculos])

  const filtered = useMemo(() => {
    let list = vehiculos
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (v) =>
          `${v.marca} ${v.modelo}`.toLowerCase().includes(q) ||
          v.color.toLowerCase().includes(q) ||
          String(v.anio).includes(q)
      )
    }
    if (filtroFoto === 'sin-foto') list = list.filter(v => !tieneImagenes(v))
    if (filtroFoto === 'con-foto') list = list.filter(v => tieneImagenes(v))
    return sortVehiculos(list, sortKey)
  }, [vehiculos, sortKey, search, filtroFoto])

  return (
    <>
      {/* Search + Sort controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por marca, modelo, color, año..."
          className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortKey === opt.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="w-px bg-dark-600 mx-1" />
          {([
            { key: 'todos' as FiltroFoto, label: 'Todos' },
            { key: 'sin-foto' as FiltroFoto, label: `Sin foto (${sinFotoCount})` },
            { key: 'con-foto' as FiltroFoto, label: 'Con foto' },
          ]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFiltroFoto(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtroFoto === opt.key
                  ? opt.key === 'sin-foto'
                    ? 'bg-orange-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && search && (
        <p className="text-sm text-gray-500 mb-3">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Mobile view - Cards */}
      <div className="lg:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-gray-400">
            {search ? 'No se encontraron vehiculos' : 'No hay vehiculos registrados'}
          </div>
        ) : (
          filtered.map((vehiculo) => (
            <div
              key={vehiculo.id}
              className="bg-dark-800 border border-dark-700 rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-white">
                    {vehiculo.marca} {vehiculo.modelo}
                  </p>
                  <p className="text-sm text-gray-400">
                    {vehiculo.anio} - {vehiculo.color}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                      vehiculo.estado === 'nuevo'
                        ? 'bg-green-900/50 text-green-400'
                        : vehiculo.estado === 'certificado'
                          ? 'bg-blue-900/50 text-blue-400'
                          : 'bg-yellow-900/50 text-yellow-400'
                    }`}
                  >
                    {vehiculo.estado}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      vehiculo.activo
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}
                  >
                    {vehiculo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  {!tieneImagenes(vehiculo) && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-900/50 text-orange-400">
                      Sin foto
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-lg font-bold text-white">
                  {formatPrice(vehiculo.precio)}
                </p>
                <p className="text-sm text-gray-400">
                  {formatKilometraje(vehiculo.kilometraje)}
                </p>
              </div>
              <div className="flex gap-3 pt-3 border-t border-dark-600">
                <Link
                  href={`/admin/vehiculos/${vehiculo.id}`}
                  className="flex-1 text-center py-2 text-sm text-blue-400 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors"
                >
                  Editar
                </Link>
                <div className="flex-1">
                  <DeleteVehiculoButton id={vehiculo.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden lg:block bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Vehiculo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kilometraje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    {search
                      ? 'No se encontraron vehiculos'
                      : 'No hay vehiculos registrados'}
                  </td>
                </tr>
              ) : (
                filtered.map((vehiculo) => (
                  <tr
                    key={vehiculo.id}
                    className="hover:bg-dark-700/50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {vehiculo.marca} {vehiculo.modelo}
                        </p>
                        <p className="text-sm text-gray-400">
                          {vehiculo.anio} - {vehiculo.color}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">
                        {formatPrice(vehiculo.precio)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">
                        {formatKilometraje(vehiculo.kilometraje)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          vehiculo.estado === 'nuevo'
                            ? 'bg-green-900/50 text-green-400'
                            : vehiculo.estado === 'certificado'
                              ? 'bg-blue-900/50 text-blue-400'
                              : 'bg-yellow-900/50 text-yellow-400'
                        }`}
                      >
                        {vehiculo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            vehiculo.activo
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-red-900/50 text-red-400'
                          }`}
                        >
                          {vehiculo.activo ? 'Si' : 'No'}
                        </span>
                        {!tieneImagenes(vehiculo) && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-900/50 text-orange-400">
                            Sin foto
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/vehiculos/${vehiculo.id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Editar
                        </Link>
                        <DeleteVehiculoButton id={vehiculo.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
