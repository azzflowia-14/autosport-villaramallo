const XLSX = require('xlsx')
const path = require('path')

// Crear datos de ejemplo
const datos = [
  {
    marca: 'Toyota',
    modelo: 'Corolla XEI',
    anio: 2023,
    precio: 28000000,
    kilometraje: 15000,
    tipo: 'sedan',
    estado: 'usado',
    color: 'Blanco',
    transmision: 'automatico',
    combustible: 'nafta',
    descripcion: 'Único dueño, service oficial',
    destacado: 'no'
  },
  {
    marca: 'Volkswagen',
    modelo: 'Amarok V6',
    anio: 2024,
    precio: 65000000,
    kilometraje: 0,
    tipo: 'pickup',
    estado: 'nuevo',
    color: 'Negro',
    transmision: 'automatico',
    combustible: 'diesel',
    descripcion: '',
    destacado: 'si'
  }
]

// Crear workbook y worksheet
const wb = XLSX.utils.book_new()
const ws = XLSX.utils.json_to_sheet(datos)

// Ajustar anchos de columna
ws['!cols'] = [
  { wch: 15 },  // marca
  { wch: 20 },  // modelo
  { wch: 8 },   // anio
  { wch: 15 },  // precio
  { wch: 12 },  // kilometraje
  { wch: 12 },  // tipo
  { wch: 12 },  // estado
  { wch: 12 },  // color
  { wch: 12 },  // transmision
  { wch: 12 },  // combustible
  { wch: 30 },  // descripcion
  { wch: 10 },  // destacado
]

XLSX.utils.book_append_sheet(wb, ws, 'Vehiculos')

// Crear hoja con instrucciones
const instrucciones = [
  { Campo: 'marca', 'Valores válidos': 'Alfa Romeo, Audi, BMW, BYD, Chevrolet, Citroën, Dodge, Fiat, Ford, Honda, Hyundai, Jeep, Kia, Mazda, Mercedes-Benz, Nissan, Peugeot, RAM, Renault, Suzuki, Toyota, Volkswagen, Volvo' },
  { Campo: 'modelo', 'Valores válidos': 'Texto libre (ej: Corolla XEI, Hilux SRV)' },
  { Campo: 'anio', 'Valores válidos': 'Número entre 1900 y 2100' },
  { Campo: 'precio', 'Valores válidos': 'Número (sin puntos ni comas, ej: 28000000)' },
  { Campo: 'kilometraje', 'Valores válidos': 'Número (0 para 0km)' },
  { Campo: 'tipo', 'Valores válidos': 'sedan, suv, pickup, hatchback, coupe, van' },
  { Campo: 'estado', 'Valores válidos': 'nuevo, usado, certificado' },
  { Campo: 'color', 'Valores válidos': 'Texto libre (ej: Blanco, Negro, Gris Plata)' },
  { Campo: 'transmision', 'Valores válidos': 'manual, automatico' },
  { Campo: 'combustible', 'Valores válidos': 'nafta, diesel, gnc, nafta-gnc, hibrido, electrico' },
  { Campo: 'descripcion', 'Valores válidos': 'Texto libre (opcional)' },
  { Campo: 'destacado', 'Valores válidos': 'si/no (opcional, por defecto: no)' },
]

const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones)
wsInstrucciones['!cols'] = [
  { wch: 15 },
  { wch: 100 },
]
XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones')

// Guardar archivo
const outputPath = path.join(__dirname, '../public/plantilla-vehiculos.xlsx')
XLSX.writeFile(wb, outputPath)

console.log('Plantilla generada en:', outputPath)
