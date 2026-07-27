import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contactate con Autosport Emanuel Berdullas. Av. J. Newbery 345, Villa Ramallo. Atención por WhatsApp.',
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children
}
