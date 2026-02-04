'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/Button'
import { marcas, tiposVehiculo, estadosVehiculo, transmisiones, combustibles } from '@/lib/utils'

interface VehiculoRow {
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
  descripcion?: string
  destacado?: boolean
}

interface ValidationError {
  fila: number
  campo: string
  mensaje: string
}

const tiposValidos = tiposVehiculo.map(t => t.value)
const estadosValidos = estadosVehiculo.map(e => e.value)
const transmisionesValidas = transmisiones.map(t => t.value)
const combustiblesValidos = combustibles.map(c => c.value)

function normalizeValue(value: string, validValues: string[]): string | null {
  const normalized = value.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quita acentos

  const match = validValues.find(v =>
    v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized
  )
  return match || null
}

function validateRow(row: VehiculoRow, index: number): ValidationError[] {
  const errors: ValidationError[] = []
  const fila = index + 2 // +2 porque header es fila 1 y array empieza en 0

  if (!row.marca?.trim()) {
    errors.push({ fila, campo: 'marca', mensaje: 'Marca es requerida' })
  }

  if (!row.modelo?.trim()) {
    errors.push({ fila, campo: 'modelo', mensaje: 'Modelo es requerido' })
  }

  if (!row.anio || row.anio < 1900 || row.anio > 2100) {
    errors.push({ fila, campo: 'anio', mensaje: 'Año debe estar entre 1900 y 2100' })
  }

  if (!row.precio || row.precio <= 0) {
    errors.push({ fila, campo: 'precio', mensaje: 'Precio debe ser mayor a 0' })
  }

  if (row.kilometraje === undefined || row.kilometraje < 0) {
    errors.push({ fila, campo: 'kilometraje', mensaje: 'Kilometraje debe ser 0 o mayor' })
  }

  if (!row.tipo || !normalizeValue(row.tipo, tiposValidos)) {
    errors.push({ fila, campo: 'tipo', mensaje: `Tipo no válido. Usar: ${tiposValidos.join(', ')}` })
  }

  if (!row.estado || !normalizeValue(row.estado, estadosValidos)) {
    errors.push({ fila, campo: 'estado', mensaje: `Estado no válido. Usar: ${estadosValidos.join(', ')}` })
  }

  if (!row.color?.trim()) {
    errors.push({ fila, campo: 'color', mensaje: 'Color es requerido' })
  }

  if (!row.transmision || !normalizeValue(row.transmision, transmisionesValidas)) {
    errors.push({ fila, campo: 'transmision', mensaje: `Transmisión no válida. Usar: ${transmisionesValidas.join(', ')}` })
  }

  if (!row.combustible || !normalizeValue(row.combustible, combustiblesValidos)) {
    errors.push({ fila, campo: 'combustible', mensaje: `Combustible no válido. Usar: ${combustiblesValidos.join(', ')}` })
  }

  return errors
}

function parseRow(row: Record<string, unknown>): VehiculoRow {
  const destacadoValue = row['destacado']
  let destacado = false
  if (typeof destacadoValue === 'boolean') {
    destacado = destacadoValue
  } else if (typeof destacadoValue === 'string') {
    destacado = ['si', 'sí', 'true', '1', 'x'].includes(destacadoValue.toLowerCase().trim())
  } else if (typeof destacadoValue === 'number') {
    destacado = destacadoValue === 1
  }

  return {
    marca: String(row['marca'] || '').trim(),
    modelo: String(row['modelo'] || '').trim(),
    anio: Number(row['anio']) || 0,
    precio: Number(row['precio']) || 0,
    kilometraje: Number(row['kilometraje']) || 0,
    tipo: String(row['tipo'] || '').toLowerCase().trim(),
    estado: String(row['estado'] || '').toLowerCase().trim(),
    color: String(row['color'] || '').trim(),
    transmision: String(row['transmision'] || '').toLowerCase().trim(),
    combustible: String(row['combustible'] || '').toLowerCase().trim(),
    descripcion: row['descripcion'] ? String(row['descripcion']).trim() : undefined,
    destacado,
  }
}

export default function ImportarVehiculosPage() {
  const router = useRouter()
  const [vehiculos, setVehiculos] = useState<VehiculoRow[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{
    mensaje: string
    exitosos: number
    errores: { fila: number; error: string }[]
  } | null>(null)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]

        if (jsonData.length === 0) {
          setErrors([{ fila: 0, campo: 'archivo', mensaje: 'El archivo está vacío' }])
          setVehiculos([])
          return
        }

        const parsedVehiculos = jsonData.map(parseRow)
        const allErrors: ValidationError[] = []
        const allWarnings: string[] = []

        parsedVehiculos.forEach((v, i) => {
          const rowErrors = validateRow(v, i)
          allErrors.push(...rowErrors)

          // Warning si la marca no está en la lista conocida
          if (v.marca && !marcas.some(m => m.toLowerCase() === v.marca.toLowerCase())) {
            allWarnings.push(`Fila ${i + 2}: Marca "${v.marca}" no está en la lista predefinida`)
          }
        })

        // Normalizar valores válidos
        const normalizedVehiculos = parsedVehiculos.map(v => ({
          ...v,
          tipo: normalizeValue(v.tipo, tiposValidos) || v.tipo,
          estado: normalizeValue(v.estado, estadosValidos) || v.estado,
          transmision: normalizeValue(v.transmision, transmisionesValidas) || v.transmision,
          combustible: normalizeValue(v.combustible, combustiblesValidos) || v.combustible,
        }))

        setVehiculos(normalizedVehiculos)
        setErrors(allErrors)
        setWarnings(allWarnings)
      } catch {
        setErrors([{ fila: 0, campo: 'archivo', mensaje: 'Error al leer el archivo. Asegurate de que sea un Excel válido.' }])
        setVehiculos([])
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const handleImport = async () => {
    if (errors.length > 0 || vehiculos.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/vehiculos/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehiculos }),
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult(result)
        if (result.exitosos === vehiculos.length) {
          setTimeout(() => router.push('/admin/vehiculos'), 2000)
        }
      } else {
        setErrors([{ fila: 0, campo: 'servidor', mensaje: result.error || 'Error al importar' }])
      }
    } catch {
      setErrors([{ fila: 0, campo: 'red', mensaje: 'Error de conexión' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Importar Vehículos</h1>
          <p className="text-zinc-400 mt-1">Cargá un archivo Excel para importar vehículos en lote</p>
        </div>
        <a
          href="/plantilla-vehiculos.xlsx"
          download
          className="text-red-500 hover:text-red-400 underline text-sm"
        >
          Descargar plantilla Excel
        </a>
      </div>

      {/* Upload area */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 text-zinc-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-2 text-sm text-zinc-400">
              {fileName ? (
                <span className="font-medium text-white">{fileName}</span>
              ) : (
                <>Click para seleccionar o arrastrá un archivo</>
              )}
            </p>
            <p className="text-xs text-zinc-500">Excel (.xlsx, .xls)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <h3 className="font-medium text-red-400 mb-2">Errores encontrados ({errors.length})</h3>
          <ul className="text-sm text-red-300 space-y-1 max-h-40 overflow-y-auto">
            {errors.map((e, i) => (
              <li key={i}>
                {e.fila > 0 ? `Fila ${e.fila}` : 'Archivo'} - {e.campo}: {e.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
          <h3 className="font-medium text-yellow-400 mb-2">Advertencias ({warnings.length})</h3>
          <ul className="text-sm text-yellow-300 space-y-1 max-h-40 overflow-y-auto">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div className={`rounded-lg p-4 ${
          importResult.errores.length === 0
            ? 'bg-green-900/20 border border-green-800'
            : 'bg-yellow-900/20 border border-yellow-800'
        }`}>
          <h3 className={`font-medium mb-2 ${
            importResult.errores.length === 0 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {importResult.mensaje}
          </h3>
          {importResult.errores.length > 0 && (
            <ul className="text-sm text-yellow-300 space-y-1">
              {importResult.errores.map((e, i) => (
                <li key={i}>Fila {e.fila}: {e.error}</li>
              ))}
            </ul>
          )}
          {importResult.exitosos === vehiculos.length && (
            <p className="text-green-400 text-sm mt-2">Redirigiendo al listado...</p>
          )}
        </div>
      )}

      {/* Preview table */}
      {vehiculos.length > 0 && errors.length === 0 && !importResult && (
        <>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-medium text-white">
                Vista previa ({vehiculos.length} vehículos)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800 text-zinc-400">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Marca</th>
                    <th className="px-4 py-2 text-left">Modelo</th>
                    <th className="px-4 py-2 text-left">Año</th>
                    <th className="px-4 py-2 text-left">Precio</th>
                    <th className="px-4 py-2 text-left">Km</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Color</th>
                    <th className="px-4 py-2 text-left">Trans.</th>
                    <th className="px-4 py-2 text-left">Comb.</th>
                    <th className="px-4 py-2 text-left">Dest.</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  {vehiculos.map((v, i) => (
                    <tr key={i} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-4 py-2 text-zinc-500">{i + 1}</td>
                      <td className="px-4 py-2">{v.marca}</td>
                      <td className="px-4 py-2">{v.modelo}</td>
                      <td className="px-4 py-2">{v.anio}</td>
                      <td className="px-4 py-2">${v.precio.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-2">{v.kilometraje.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-2">{v.tipo}</td>
                      <td className="px-4 py-2">{v.estado}</td>
                      <td className="px-4 py-2">{v.color}</td>
                      <td className="px-4 py-2">{v.transmision}</td>
                      <td className="px-4 py-2">{v.combustible}</td>
                      <td className="px-4 py-2">{v.destacado ? 'Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => router.push('/admin/vehiculos')}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? 'Importando...' : `Importar ${vehiculos.length} vehículos`}
            </Button>
          </div>
        </>
      )}

      {/* Instructions */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <h3 className="font-medium text-white mb-3">Instrucciones</h3>
        <ul className="text-sm text-zinc-400 space-y-2">
          <li>1. Descargá la plantilla Excel y completala con los vehículos</li>
          <li>2. Subí el archivo y revisá la vista previa</li>
          <li>3. Corregí los errores si los hay</li>
          <li>4. Hacé clic en &quot;Importar&quot; para cargar los vehículos</li>
          <li>5. Las fotos se suben después editando cada vehículo</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <h4 className="font-medium text-white mb-2">Valores válidos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-500">Tipo:</span>
              <p className="text-zinc-400">{tiposValidos.join(', ')}</p>
            </div>
            <div>
              <span className="text-zinc-500">Estado:</span>
              <p className="text-zinc-400">{estadosValidos.join(', ')}</p>
            </div>
            <div>
              <span className="text-zinc-500">Transmisión:</span>
              <p className="text-zinc-400">{transmisionesValidas.join(', ')}</p>
            </div>
            <div>
              <span className="text-zinc-500">Combustible:</span>
              <p className="text-zinc-400">{combustiblesValidos.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
