'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
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
      const response = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar el mensaje')
      }

      setSuccess(true)
      setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el mensaje')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header con gradiente */}
      <div className="relative bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-autosport-red/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-autosport-red/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bebas tracking-wide text-white mb-4">Contactanos</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Estamos para ayudarte. Escribinos y te respondemos a la brevedad.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        {/* Cards de contacto rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <a
            href="https://wa.me/5493329593046"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-green-500/50 hover:bg-dark-800/80 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">WhatsApp</h3>
                <p className="text-green-500">+54 9 3329 593046</p>
              </div>
            </div>
          </a>

          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-autosport-red/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-autosport-red/10 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Ubicación</h3>
                <p className="text-gray-400">Av. J. Newbery 345, V. Ramallo</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-autosport-red/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-autosport-red/10 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Horarios</h3>
                <p className="text-gray-400">Lun-Vie 8-12 y 16-20</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-3">
            <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Envianos un mensaje</h2>

              {success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">¡Mensaje enviado!</h3>
                  <p className="text-gray-400 mb-6">
                    Recibimos tu mensaje. Te responderemos pronto.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-autosport-red hover:text-autosport-red-light font-semibold transition-colors"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre"
                    />
                    <Input
                      label="Teléfono"
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Tu teléfono"
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                  />

                  <Input
                    label="Asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    placeholder="¿En qué podemos ayudarte?"
                  />

                  <Textarea
                    label="Mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    placeholder="Escribí tu mensaje acá..."
                    rows={5}
                  />

                  <Button type="submit" isLoading={isLoading} className="w-full">
                    Enviar mensaje
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Mapa e info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden h-72">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.5!2d-60.0489!3d-33.4906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b76412dbf7fa13%3A0x1234567890!2sAv.%20Jorge%20Newbery%20345%2C%20Villa%20Ramallo!5e0!3m2!1ses!2sar!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>

            <a
              href="https://www.instagram.com/autosportvillaramallo"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Seguinos en Instagram</h3>
                  <p className="text-white/80">@autosportvillaramallo</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
