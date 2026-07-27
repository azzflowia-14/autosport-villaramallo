import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cotizá tu auto',
  description:
    'Vendé o entregá tu auto como parte de pago. Subí las fotos y recibí una cotización en menos de 24 horas.',
}

export default function CotizarLayout({ children }: { children: React.ReactNode }) {
  return children
}
