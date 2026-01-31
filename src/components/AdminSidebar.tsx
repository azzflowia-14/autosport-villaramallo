'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface AdminSidebarProps {
  user?: {
    name?: string | null
    email?: string | null
  }
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/vehiculos', label: 'Vehículos', icon: 'M19 9l-7 7-7-7' },
  { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/admin/mensajes', label: 'Mensajes', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Cerrar el menú con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <>
      {/* Header móvil */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center space-x-2">
          <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-base font-bold text-white">Autosport V. Ramallo</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-300 hover:text-white focus:outline-none"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Overlay para cerrar el menú en móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:transform-none',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-6 hidden lg:block">
          <Link href="/admin" className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-lg font-bold text-white">Autosport V. Ramallo</span>
          </Link>
        </div>

        {/* Espaciador para el header en móvil */}
        <div className="h-16 lg:hidden" />

        <nav className="mt-2 lg:mt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors',
                (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) && 'bg-gray-800 text-white border-l-4 border-blue-500'
              )}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 lg:p-6 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/"
              className="flex-1 px-3 py-2 text-sm text-gray-300 bg-gray-800 rounded hover:bg-gray-700 text-center transition-colors"
            >
              Ver sitio
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex-1 px-3 py-2 text-sm text-gray-300 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
