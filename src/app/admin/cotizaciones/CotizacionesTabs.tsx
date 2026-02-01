'use client'

import { useState, ReactNode } from 'react'

interface CotizacionesTabsProps {
  children: ReactNode
  pendientesCotizaciones: number
  pendientesTasaciones: number
}

export function CotizacionesTabs({ children, pendientesCotizaciones, pendientesTasaciones }: CotizacionesTabsProps) {
  const [activeTab, setActiveTab] = useState<'cotizaciones' | 'tasaciones'>('tasaciones')

  // Extraer los children por data-tab
  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tasaciones')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'tasaciones'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tasaciones de Usados
          {pendientesTasaciones > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              {pendientesTasaciones}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('cotizaciones')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cotizaciones'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Consultas de Catálogo
          {pendientesCotizaciones > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              {pendientesCotizaciones}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {childrenArray.map((child, index) => {
        if (!child || typeof child !== 'object') return null
        const element = child as React.ReactElement<{ 'data-tab'?: string }>
        const tabName = element.props?.['data-tab']
        if (tabName === activeTab) {
          return <div key={index}>{child}</div>
        }
        return null
      })}
    </div>
  )
}
