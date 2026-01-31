export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatKilometraje(km: number): string {
  return new Intl.NumberFormat('es-MX').format(km) + ' km'
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
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'electrico', label: 'Eléctrico' },
]

export const marcas = [
  'Toyota', 'Honda', 'Nissan', 'Volkswagen', 'Ford',
  'Chevrolet', 'Mazda', 'Hyundai', 'Kia', 'BMW',
  'Mercedes-Benz', 'Audi', 'Jeep', 'Dodge', 'RAM'
]
