// Datos del negocio centralizados. Cualquier cambio de número/dirección se hace acá.
export const NEGOCIO = {
  nombre: 'Autosport Emanuel Berdullas',
  nombreCorto: 'Autosport',
  descripcion:
    'Venta de vehículos 0km y usados en Villa Ramallo. Financiación propia, transferencias y el mejor servicio.',
  direccion: 'Av. J. Newbery 345',
  localidad: 'Villa Ramallo',
  provincia: 'Buenos Aires',
  whatsapp: '5493329593046',
  whatsappDisplay: '+54 9 3329 59-3046',
  instagram: 'https://www.instagram.com/autosportvillaramallo',
  horarios: [
    { dias: 'Lun a Vie', horas: '8 a 12 y 16 a 20' },
    { dias: 'Sáb y Feriados', horas: '8:30 a 12:30' },
  ],
} as const

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.autosportemanuelberdullas.com.ar'
).trim()

export function waLink(mensaje: string): string {
  return `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(mensaje)}`
}

export function waLinkVehiculo(vehiculo: {
  marca: string
  modelo: string
  anio: number
}): string {
  return waLink(
    `Hola! Me interesa el ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio} que vi en la web. ¿Está disponible?`
  )
}
