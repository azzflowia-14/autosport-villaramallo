'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

const marcasPopulares = [
  'Chevrolet', 'Ford', 'Fiat', 'Volkswagen', 'Toyota', 'Renault',
  'Peugeot', 'Citroën', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Otra'
]

const anios = Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i)

export default function CotizarPage() {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: '',
    kilometraje: '',
    combustible: '',
    transmision: '',
    color: '',
    descripcion: '',
    nombre: '',
    email: '',
    telefono: '',
  })
  const [imagenes, setImagenes] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (imagenes.length + acceptedFiles.length > 10) {
      setError('Máximo 10 fotos permitidas')
      return
    }

    setUploading(true)
    setError('')

    const formDataUpload = new FormData()
    acceptedFiles.forEach(file => formDataUpload.append('files', file))

    try {
      const res = await fetch('/api/tasaciones/upload', {
        method: 'POST',
        body: formDataUpload,
      })
      const data = await res.json()

      if (data.urls) {
        setImagenes(prev => [...prev, ...data.urls])
      }
      if (data.errors) {
        setError(data.errors.join(', '))
      }
    } catch {
      setError('Error al subir las fotos')
    } finally {
      setUploading(false)
    }
  }, [imagenes.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'] },
    maxSize: 10 * 1024 * 1024,
  })

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (imagenes.length === 0) {
      setError('Subí al menos una foto de tu vehículo')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/tasaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          anio: parseInt(formData.anio),
          kilometraje: parseInt(formData.kilometraje.replace(/\D/g, '')),
          imagenes: JSON.stringify(imagenes),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bebas text-white mb-4">¡Solicitud Enviada!</h1>
          <p className="text-gray-400 mb-6">
            Recibimos los datos de tu vehículo. En menos de 24 horas te contactamos con nuestra cotización.
          </p>
          <a href="/" className="text-autosport-red hover:underline">
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <section className="relative bg-dark-900 overflow-hidden py-6 lg:py-8 border-b border-dark-700">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bebas tracking-wide text-white mb-2">
              Cotizá tu Vehículo
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              ¿Querés vender tu auto o usarlo como parte de pago? Completá el formulario y te enviamos una cotización en menos de 24 horas.
            </p>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Datos del Vehículo */}
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-autosport-red rounded-full flex items-center justify-center text-sm">1</span>
                Datos del Vehículo
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Marca *</label>
                  <select
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-autosport-red focus:outline-none"
                  >
                    <option value="">Seleccionar marca</option>
                    {marcasPopulares.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Modelo *</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Cruze LT"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-autosport-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Año *</label>
                  <select
                    name="anio"
                    value={formData.anio}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-autosport-red focus:outline-none"
                  >
                    <option value="">Seleccionar año</option>
                    {anios.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Kilometraje *</label>
                  <input
                    type="text"
                    name="kilometraje"
                    value={formData.kilometraje}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 50000"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-autosport-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Combustible *</label>
                  <select
                    name="combustible"
                    value={formData.combustible}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-autosport-red focus:outline-none"
                  >
                    <option value="">Seleccionar</option>
                    <option value="nafta">Nafta</option>
                    <option value="diesel">Diesel</option>
                    <option value="gnc">GNC</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="electrico">Eléctrico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Transmisión *</label>
                  <select
                    name="transmision"
                    value={formData.transmision}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:border-autosport-red focus:outline-none"
                  >
                    <option value="">Seleccionar</option>
                    <option value="manual">Manual</option>
                    <option value="automatico">Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Color *</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Blanco"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-autosport-red focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-1">Descripción adicional</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Contanos sobre el estado del vehículo, accesorios, detalles importantes..."
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-autosport-red focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Fotos */}
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-autosport-red rounded-full flex items-center justify-center text-sm">2</span>
                Fotos del Vehículo
              </h2>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-autosport-red bg-autosport-red/10'
                    : 'border-dark-600 hover:border-dark-500'
                }`}
              >
                <input {...getInputProps()} />
                <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {uploading ? (
                  <p className="text-gray-400">Subiendo fotos...</p>
                ) : (
                  <>
                    <p className="text-gray-300 mb-1">Arrastrá las fotos acá o hacé clic para seleccionar</p>
                    <p className="text-gray-500 text-sm">JPG, PNG, WEBP, HEIC - Máx 10MB cada una - Hasta 10 fotos</p>
                  </>
                )}
              </div>

              {/* Preview de fotos */}
              {imagenes.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {imagenes.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={url}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-gray-500 text-sm mt-3">
                Subí fotos del exterior, interior, motor y cualquier detalle importante. Cuantas más fotos, mejor cotización podemos darte.
              </p>
            </div>

            {/* Datos de Contacto */}
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-autosport-red rounded-full flex items-center justify-center text-sm">3</span>
                Tus Datos de Contacto
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-autosport-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-autosport-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 3407512345"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-autosport-red focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                disabled={submitting || uploading}
                className="min-w-[200px]"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
              <p className="text-gray-500 text-sm mt-3">
                Te contactamos en menos de 24 horas con nuestra cotización
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
