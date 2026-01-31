'use client'

import { useState } from 'react'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { Button } from './ui/Button'

interface FormCotizacionProps {
  vehiculoId?: number
  vehiculoNombre?: string
}

export function FormCotizacion({ vehiculoId, vehiculoNombre }: FormCotizacionProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehiculoId: vehiculoId || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar la cotización')
      }

      setSuccess(true)
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la cotización')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-lg font-semibold text-green-800 mb-2">¡Solicitud enviada!</h3>
        <p className="text-green-600">
          Hemos recibido tu solicitud de cotización. Un asesor se pondrá en contacto contigo pronto.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-green-700 underline hover:text-green-800"
        >
          Enviar otra cotización
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {vehiculoNombre && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Vehículo seleccionado:</span> {vehiculoNombre}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Input
        label="Nombre completo"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
        placeholder="Tu nombre"
      />

      <Input
        label="Correo electrónico"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="tu@email.com"
      />

      <Input
        label="Teléfono"
        type="tel"
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
        required
        placeholder="(55) 1234-5678"
      />

      <Textarea
        label="Mensaje (opcional)"
        name="mensaje"
        value={formData.mensaje}
        onChange={handleChange}
        placeholder="Cuéntanos más sobre lo que buscas..."
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Solicitar cotización
      </Button>
    </form>
  )
}
