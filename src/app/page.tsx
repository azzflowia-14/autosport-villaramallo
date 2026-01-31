import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { VehiculoCard } from '@/components/VehiculoCard'
import { Button } from '@/components/ui/Button'

// Forzar renderizado dinámico (no estático)
export const dynamic = 'force-dynamic'

async function getVehiculosDestacados() {
  return prisma.vehiculo.findMany({
    where: { destacado: true, activo: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })
}

async function getVehiculos0KM() {
  return prisma.vehiculo.findMany({
    where: { estado: 'nuevo', activo: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })
}

async function getVehiculosUsados() {
  return prisma.vehiculo.findMany({
    where: { estado: 'usado', activo: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })
}

// Componente separador moderno
function SectionDivider() {
  return (
    <div className="relative h-16 bg-dark-900 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-xs flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-600 to-dark-600"></div>
          <div className="w-2 h-2 rotate-45 bg-autosport-red"></div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-dark-600 to-dark-600"></div>
        </div>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const [vehiculosDestacados, vehiculos0KM, vehiculosUsados] = await Promise.all([
    getVehiculosDestacados(),
    getVehiculos0KM(),
    getVehiculosUsados(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-black overflow-hidden">
        {/* Efecto Spotlight */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/10 via-white/5 to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-block mb-3 p-1 rounded-full bg-gradient-to-br from-white/15 via-gray-300/5 to-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-1 ring-white/15">
              <Image
                src="/images/logo.png"
                alt="Autosport Villa Ramallo"
                width={200}
                height={200}
                className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                priority
              />
            </div>

            <h1 className="text-3xl md:text-5xl font-bebas tracking-wide mb-1 text-white">
              Villa Ramallo
            </h1>
            <p className="text-lg text-gray-400 mb-4 max-w-2xl mx-auto">
              Venta de vehículos <span className="text-autosport-red font-bold">0KM</span> y <span className="text-autosport-red font-bold">usados</span>.
              Financiación propia, transferencias y el mejor servicio.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/catalogo">
                <Button size="lg">
                  Ver Catálogo
                </Button>
              </Link>
              <Link href="/cotizar">
                <Button size="lg" variant="outline">
                  Cotizar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Vehículos Destacados */}
      {vehiculosDestacados.length > 0 && (
        <section className="bg-dark-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-white">Destacados</h2>
                <p className="text-gray-400 mt-1">Nuestras mejores unidades</p>
              </div>
              <Link href="/catalogo" className="text-autosport-red font-semibold hover:text-autosport-red-light transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehiculosDestacados.map((vehiculo) => (
                <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* 0KM Section */}
      {vehiculos0KM.length > 0 && (
        <section className="bg-dark-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-white">
                  <span className="text-autosport-red">0KM</span> Disponibles
                </h2>
                <p className="text-gray-400 mt-1">Vehículos nuevos con garantía oficial</p>
              </div>
              <Link href="/catalogo?estado=nuevo" className="text-autosport-red font-semibold hover:text-autosport-red-light transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehiculos0KM.map((vehiculo) => (
                <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* Usados Section */}
      {vehiculosUsados.length > 0 && (
        <section className="bg-dark-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bebas tracking-wide text-white">Usados Seleccionados</h2>
                <p className="text-gray-400 mt-1">Unidades revisadas y garantizadas</p>
              </div>
              <Link href="/catalogo?estado=usado" className="text-autosport-red font-semibold hover:text-autosport-red-light transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehiculosUsados.map((vehiculo) => (
                <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* Servicios */}
      <section className="bg-dark-800 py-16 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Nuestros Servicios</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitás para tu próximo vehículo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-dark-900 rounded-xl border border-dark-700 hover:border-autosport-red/50 transition-colors">
              <div className="w-16 h-16 bg-autosport-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Financiación</h3>
              <p className="text-gray-400">
                Financiá tu auto de forma simple y rápida. Sin intermediarios, desde tu celu.
              </p>
            </div>

            <div className="text-center p-6 bg-dark-900 rounded-xl border border-dark-700 hover:border-autosport-red/50 transition-colors">
              <div className="w-16 h-16 bg-autosport-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Transferencias</h3>
              <p className="text-gray-400">
                Gestionamos toda la documentación y transferencia de tu vehículo.
              </p>
            </div>

            <div className="text-center p-6 bg-dark-900 rounded-xl border border-dark-700 hover:border-autosport-red/50 transition-colors">
              <div className="w-16 h-16 bg-autosport-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Garantía</h3>
              <p className="text-gray-400">
                Todos nuestros vehículos cuentan con garantía para tu tranquilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Financiación */}
      <section className="relative bg-gradient-to-r from-autosport-red to-autosport-red-dark py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
            ¿Querés financiar tu próximo auto sin vueltas?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
            Ahora podés cotizar tu financiación vos mismo, de forma simple y rápida.
          </p>
          <ul className="flex flex-wrap justify-center gap-6 mb-8 text-white/90">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Sin intermediarios
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Sin perder tiempo
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Desde tu celu
            </li>
          </ul>
          <Link href="/cotizar">
            <Button size="lg" className="!bg-white !text-autosport-red hover:!bg-gray-100 font-black">
              Cotizar Financiación →
            </Button>
          </Link>
        </div>
      </section>

      {/* Ubicación */}
      <section className="bg-dark-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Visitanos</h2>
              <p className="text-gray-400 mb-6">
                Te esperamos en nuestra concesionaria para que conozcas todas nuestras unidades.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-autosport-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Dirección</p>
                    <p className="text-gray-400">Av. J. Newbery 345, Villa Ramallo</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-autosport-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-autosport-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Horarios</p>
                    <p className="text-gray-400">Lun a Vie: 8 a 12 y 16 a 20</p>
                    <p className="text-gray-400">Sáb y Feriados: 8:30 a 12:30</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">WhatsApp</p>
                    <a href="https://wa.me/5493329593046" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 transition-colors">
                      +54 9 3329 593046
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden h-[300px] md:h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.5!2d-60.0489!3d-33.4906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b76412dbf7fa13%3A0x1234567890!2sAv.%20Jorge%20Newbery%20345%2C%20Villa%20Ramallo!5e0!3m2!1ses!2sar!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
