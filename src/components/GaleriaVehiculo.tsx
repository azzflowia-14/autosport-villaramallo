'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GaleriaVehiculoProps {
  imagenes: string
  marca: string
  modelo: string
}

export function GaleriaVehiculo({ imagenes, marca, modelo }: GaleriaVehiculoProps) {
  const imagenesArray: string[] = (() => {
    try {
      return JSON.parse(imagenes || '[]')
    } catch {
      return []
    }
  })()

  const [imagenActiva, setImagenActiva] = useState(0)

  if (imagenesArray.length === 0) {
    return (
      <div className="aspect-[4/3] bg-dark-700 rounded-xl overflow-hidden flex items-center justify-center">
        <svg className="w-24 h-24 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const irAnterior = () => {
    setImagenActiva((prev) => (prev === 0 ? imagenesArray.length - 1 : prev - 1))
  }

  const irSiguiente = () => {
    setImagenActiva((prev) => (prev === imagenesArray.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] bg-dark-700 rounded-xl overflow-hidden relative group">
        <Image
          src={imagenesArray[imagenActiva]}
          alt={`${marca} ${modelo}`}
          fill
          className="object-cover"
          priority
        />

        {imagenesArray.length > 1 && (
          <>
            {/* Flecha izquierda */}
            <button
              onClick={irAnterior}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen anterior"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Flecha derecha */}
            <button
              onClick={irSiguiente}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen siguiente"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicador de posición */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {imagenActiva + 1} / {imagenesArray.length}
            </div>
          </>
        )}
      </div>

      {imagenesArray.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {imagenesArray.map((img, index) => (
            <button
              key={img}
              onClick={() => setImagenActiva(index)}
              className={`aspect-square rounded-lg overflow-hidden relative border-2 transition-colors ${
                index === imagenActiva
                  ? 'border-autosport-red'
                  : 'border-transparent hover:border-gray-400'
              }`}
            >
              <Image
                src={img}
                alt={`${marca} ${modelo} - ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
