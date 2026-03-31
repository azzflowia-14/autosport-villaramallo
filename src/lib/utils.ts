export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatKilometraje(km: number): string {
  return new Intl.NumberFormat('es-AR').format(km) + ' km'
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const tiposVehiculo = [
  { value: 'sedan', label: 'Sedán' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'van', label: 'Van' },
  { value: 'moto', label: 'Moto' },
]

export const estadosVehiculo = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'usado', label: 'Usado' },
  { value: 'certificado', label: 'Certificado' },
]

export const transmisiones = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatico', label: 'Automático' },
]

export const combustibles = [
  { value: 'nafta', label: 'Nafta' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'gnc', label: 'GNC' },
  { value: 'nafta-gnc', label: 'Nafta + GNC' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'electrico', label: 'Eléctrico' },
]

export const marcas = [
  'Alfa Romeo', 'Audi', 'BMW', 'BYD', 'Chevrolet',
  'Citroën', 'Dodge', 'Ducati', 'Fiat', 'Ford', 'Honda',
  'Hyundai', 'Jeep', 'Kia', 'Mazda', 'Mercedes-Benz',
  'Nissan', 'Peugeot', 'RAM', 'Renault', 'Suzuki',
  'Toyota', 'Volkswagen', 'Volvo'
]

export const estadosStock = [
  { value: 'disponible', label: 'Disponible', color: 'green' },
  { value: 'reservado', label: 'Reservado', color: 'yellow' },
  { value: 'en_preparacion', label: 'En Preparación', color: 'blue' },
  { value: 'vendido', label: 'Vendido', color: 'gray' },
]

export function calcularDiasEnStock(fechaIngreso: string | Date): number {
  const ingreso = new Date(fechaIngreso)
  const hoy = new Date()
  return Math.floor((hoy.getTime() - ingreso.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatPriceShort(price: number): string {
  if (price >= 1000000) {
    const m = price / 1000000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`
  }
  return `$${price}`
}
