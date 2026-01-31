import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SimuladorFinanciamiento } from '@/components/SimuladorFinanciamiento'

export default function CotizarPage() {
  return (
    <div className="min-h-screen">
      {/* Hero con Simulador */}
      <section className="relative bg-dark-900 overflow-hidden py-6 lg:py-8">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header igual que catálogo */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bebas tracking-wide text-white mb-1">Cotizador de Financiación</h1>
            <p className="text-gray-400 text-sm">
              Elegí el auto, ingresá tu entrega y calculá las cuotas
            </p>
          </div>

          {/* Simulador */}
          <SimuladorFinanciamiento />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-dark-900 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-white text-center mb-12">
            ¿Cómo funciona?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-autosport-red rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Elegí tu auto</h3>
              <p className="text-gray-400">
                Seleccioná el vehículo de nuestro catálogo que más te guste.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-autosport-red rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ingresá tu entrega</h3>
              <p className="text-gray-400">
                Indicá cuánto dinero tenés disponible y calculamos la diferencia.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-autosport-red rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cotizá las cuotas</h3>
              <p className="text-gray-400">
                Calculá las cuotas del monto a financiar y elegí el mejor plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="bg-dark-800 py-16 border-y border-dark-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-white text-center mb-12">
            Beneficios de financiar con nosotros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 bg-dark-900 p-6 rounded-xl border border-dark-700">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Sin requisitos complicados</h3>
                <p className="text-gray-400 text-sm">DNI y recibo de sueldo. Así de simple.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-dark-900 p-6 rounded-xl border border-dark-700">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Cuotas fijas en pesos</h3>
                <p className="text-gray-400 text-sm">Sabés exactamente cuánto pagás cada mes.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-dark-900 p-6 rounded-xl border border-dark-700">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Aprobación rápida</h3>
                <p className="text-gray-400 text-sm">Respuesta en 24-48 horas hábiles.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-dark-900 p-6 rounded-xl border border-dark-700">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Asesoramiento personalizado</h3>
                <p className="text-gray-400 text-sm">Te ayudamos a elegir el mejor plan para vos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA alternativo */}
      <section className="bg-dark-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 mb-4">
            ¿Preferís que te asesoremos personalmente?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5493407510895?text=Hola!%20Quiero%20consultar%20por%20financiación"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <Link href="/contacto">
              <Button variant="outline" size="lg">
                Enviar consulta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
