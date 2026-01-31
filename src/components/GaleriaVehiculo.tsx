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

  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] bg-dark-700 rounded-xl overflow-hidden relative">
        <Image
          src={imagenesArray[imagenActiva]}
          alt={`${marca} ${modelo}`}
          fill
          className="object-cover"
          priority
        />
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
