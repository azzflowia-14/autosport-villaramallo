'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function ConfiguracionPreciosPage() {
  const [config, setConfig] = useState({ descuentoCDO: 15, porcentajeEntrega: 30, tasaX12: 5 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/config-precios')
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/config-precios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setMsg('Configuración guardada')
        setTimeout(() => setMsg(''), 3000)
      } else {
        setMsg('Error al guardar')
      }
    } catch {
      setMsg('Error de conexión')
    }
    setSaving(false)
  }

  // Preview con ejemplo
  const precioEjemplo = 20000000 // $20M
  const cdoEj = Math.round(precioEjemplo * (1 - config.descuentoCDO / 100))
  const entregaEj = Math.round(precioEjemplo * (config.porcentajeEntrega / 100))
  const x12Ej = Math.round(((precioEjemplo - entregaEj) / 12) * (1 + config.tasaX12 / 100))

  if (loading) {
    return <div className="text-gray-400 text-center py-12">Cargando...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Configuración de Precios</h1>
          <p className="text-sm text-gray-400">Fórmulas para auto-cálculo de CDO, Entrega y Cuotas</p>
        </div>
        <Link href="/admin/stock" className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600">
          ← Volver
        </Link>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 space-y-6">
        {/* CDO */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Descuento Contado (CDO)
          </label>
          <p className="text-xs text-gray-500 mb-2">CDO = Precio Lista × (100% - descuento%)</p>
          <div className="flex items-center gap-2">
            <input type="number" value={config.descuentoCDO}
              onChange={e => setConfig({ ...config, descuentoCDO: parseFloat(e.target.value) || 0 })}
              min={0} max={100} step={0.5}
              className="w-24 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-gray-400">%</span>
          </div>
        </div>

        {/* Entrega */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Porcentaje de Entrega
          </label>
          <p className="text-xs text-gray-500 mb-2">Entrega = Precio Lista × porcentaje%</p>
          <div className="flex items-center gap-2">
            <input type="number" value={config.porcentajeEntrega}
              onChange={e => setConfig({ ...config, porcentajeEntrega: parseFloat(e.target.value) || 0 })}
              min={0} max={100} step={0.5}
              className="w-24 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-gray-400">%</span>
          </div>
        </div>

        {/* Tasa X12 */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tasa Cuota 12 meses
          </label>
          <p className="text-xs text-gray-500 mb-2">x12 = (Lista - Entrega) / 12 × (1 + tasa%)</p>
          <div className="flex items-center gap-2">
            <input type="number" value={config.tasaX12}
              onChange={e => setConfig({ ...config, tasaX12: parseFloat(e.target.value) || 0 })}
              min={0} max={100} step={0.5}
              className="w-24 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-gray-400">%</span>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-dark-700 rounded-lg p-4">
          <p className="text-sm font-medium text-white mb-3">Preview (auto con lista de {formatPrice(precioEjemplo)})</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-500">Lista</p>
              <p className="text-sm font-medium text-white">{formatPrice(precioEjemplo)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CDO (-{config.descuentoCDO}%)</p>
              <p className="text-sm font-medium text-green-400">{formatPrice(cdoEj)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Entrega ({config.porcentajeEntrega}%)</p>
              <p className="text-sm font-medium text-blue-400">{formatPrice(entregaEj)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">x12</p>
              <p className="text-sm font-medium text-yellow-400">{formatPrice(x12Ej)}</p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
          {msg && <span className={`text-sm ${msg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{msg}</span>}
        </div>
      </div>
    </div>
  )
}
