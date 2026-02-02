'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/ImageUploader'
import { tiposVehiculo, estadosVehiculo, transmisiones, combustibles, marcas } from '@/lib/utils'

export default function NuevoVehiculoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagenes, setImagenes] = useState<string[]>([])

  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear().toString(),
    precio: '',
    kilometraje: '',
    tipo: '',
    estado: '',
    color: '',
    transmision: '',
    combustible: '',
    descripcion: '',
    destacado: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          anio: parseInt(formData.anio) || new Date().getFullYear(),
          precio: parseFloat(formData.precio) || 0,
          kilometraje: parseInt(formData.kilometraje) || 0,
          imagenes: JSON.stringify(imagenes),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear vehículo')
      }

      router.push('/admin/vehiculos')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear vehículo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Nuevo Vehículo</h1>
        <p className="text-sm lg:text-base text-gray-600">Agrega un nuevo vehículo al inventario</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 lg:p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <Select
              label="Marca"
              name="marca"
              options={marcas.map(m => ({ value: m, label: m }))}
              value={formData.marca}
              onChange={handleChange}
              required
            />

            <Input
              label="Modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
              placeholder="Ej: Camry, CR-V, Jetta"
            />

            <Input
              label="Año"
              name="anio"
              type="number"
              value={formData.anio}
              onChange={handleChange}
              required
              min={1900}
              max={2100}
            />

            <Input
              label="Precio (ARS)"
              name="precio"
              type="number"
              value={formData.precio}
              onChange={handleChange}
              required
              min={0}
            />

            <Input
              label="Kilometraje"
              name="kilometraje"
              type="number"
              value={formData.kilometraje}
              onChange={handleChange}
              required
              min={0}
            />

            <Input
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              placeholder="Ej: Blanco, Negro, Rojo"
            />

            <Select
              label="Tipo"
              name="tipo"
              options={tiposVehiculo}
              value={formData.tipo}
              onChange={handleChange}
              required
            />

            <Select
              label="Estado"
              name="estado"
              options={estadosVehiculo}
              value={formData.estado}
              onChange={handleChange}
              required
            />

            <Select
              label="Transmisión"
              name="transmision"
              options={transmisiones}
              value={formData.transmision}
              onChange={handleChange}
              required
            />

            <Select
              label="Combustible"
              name="combustible"
              options={combustibles}
              value={formData.combustible}
              onChange={handleChange}
              required
            />
          </div>

          <Textarea
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe las características del vehículo..."
            rows={4}
          />

          <ImageUploader
            images={imagenes}
            onChange={setImagenes}
            maxImages={10}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="destacado"
              name="destacado"
              checked={formData.destacado}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="destacado" className="ml-2 text-sm text-gray-700">
              Marcar como destacado
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
              Crear Vehículo
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
