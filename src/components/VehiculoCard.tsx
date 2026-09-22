import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { waLinkVehiculo } from '@/lib/negocio'
import { Card } from './ui/Card'

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
}

interface VehiculoCardProps {
  vehiculo: Vehiculo
}

export function VehiculoCard({ vehiculo }: VehiculoCardProps) {
  const imagenesArray: string[] = (() => {
    try {
      return JSON.parse(vehiculo.imagenes || '[]')
    } catch {
      return []
    }
  })()

  const primeraImagen = imagenesArray[0]

  const estadoColors: Record<string, string> = {
    nuevo: 'bg-autosport-red text-white',
    usado: 'bg-dark-500 text-white',
    certificado: 'bg-green-600 text-white',
  }

  const estadoLabels: Record<string, string> = {
    nuevo: '0KM',
    usado: 'Usado',
    certificado: 'Certificado',
  }

  return (
    <Card className="group bg-dark-800 border-dark-700 hover:border-autosport-red/50 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        {primeraImagen ? (
          <Image
            src={primeraImagen}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-dark-700 flex items-center justify-center">
            <svg className="w-16 h-16 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {vehiculo.destacado && (
          <span className="absolute top-3 left-3 bg-autosport-red text-white text-xs font-bold uppercase px-2 py-1 rounded">
            Destacado
          </span>
        )}
        <span className={`absolute top-3 right-3 text-xs font-bold uppercase px-2 py-1 rounded ${estadoColors[vehiculo.estado] || 'bg-dark-600 text-white'}`}>
          {estadoLabels[vehiculo.estado] || vehiculo.estado}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-white group-hover:text-autosport-red transition-colors">
            {vehiculo.marca} {vehiculo.modelo}
          </h3>
          <p className="text-sm text-gray-400">{vehiculo.anio}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs bg-dark-600 text-gray-300 px-2 py-1 rounded capitalize">
            {vehiculo.transmision}
          </span>
          <span className="text-xs bg-dark-600 text-gray-300 px-2 py-1 rounded capitalize">
            {vehiculo.combustible}
          </span>
        </div>

        <div className="flex flex-col gap-3 pt-3 border-t border-dark-600">
          <p className="text-xl font-black text-autosport-red">
            {formatPrice(vehiculo.precio)}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/catalogo/${vehiculo.id}`}
              className="flex-1 text-sm font-semibold bg-autosport-red hover:bg-autosport-red-dark text-white px-4 py-2 rounded-lg transition-colors uppercase tracking-wide flex items-center justify-center gap-1 group/btn"
            >
              Ver más
              <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href={waLinkVehiculo(vehiculo)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Consultar por WhatsApp: ${vehiculo.marca} ${vehiculo.modelo}`}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Card>
  )
}
