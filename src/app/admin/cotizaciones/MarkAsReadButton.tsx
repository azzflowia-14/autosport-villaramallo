'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface MarkAsReadButtonProps {
  id: number
  type: 'cotizacion' | 'mensaje'
}

export function MarkAsReadButton({ id, type }: MarkAsReadButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkAsRead = async () => {
    setIsLoading(true)

    try {
      const endpoint = type === 'cotizacion' ? '/api/cotizaciones' : '/api/mensajes'
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type === 'cotizacion' ? 'leida' : 'leido']: true }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch {
      console.error('Error marking as read')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={isLoading}
      className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm"
    >
      {isLoading ? 'Marcando...' : 'Marcar leída'}
    </button>
  )
}
