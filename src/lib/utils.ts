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
  'Citroën', 'Dodge', 'Fiat', 'Ford', 'Honda',
  'Hyundai', 'Jeep', 'Kia', 'Mazda', 'Mercedes-Benz',
  'Nissan', 'Peugeot', 'RAM', 'Renault', 'Suzuki',
  'Toyota', 'Volkswagen', 'Volvo'
]
