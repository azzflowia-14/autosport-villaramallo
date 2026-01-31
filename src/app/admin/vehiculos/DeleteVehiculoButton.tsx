'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteVehiculoButton({ id }: { id: number }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/vehiculos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Error al eliminar el vehículo')
      }
    } catch {
      alert('Error al eliminar el vehículo')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full lg:w-auto text-center py-2 lg:py-0 text-sm text-red-600 bg-red-50 lg:bg-transparent rounded-lg lg:rounded-none hover:bg-red-100 lg:hover:bg-transparent hover:text-red-800 disabled:opacity-50 transition-colors"
    >
      {isDeleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}
