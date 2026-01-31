import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.usuario.upsert({
    where: { email: 'admin@concesionaria.com' },
    update: {},
    create: {
      email: 'admin@concesionaria.com',
      password: hashedPassword,
      nombre: 'Administrador',
      rol: 'admin',
    },
  })

  // Crear vehículos de ejemplo
  const vehiculos = [
    {
      marca: 'Toyota',
      modelo: 'Camry',
      anio: 2024,
      precio: 589000,
      kilometraje: 0,
      tipo: 'sedan',
      estado: 'nuevo',
      color: 'Blanco',
      transmision: 'automatico',
      combustible: 'gasolina',
      descripcion: 'El Toyota Camry 2024 combina elegancia, confort y tecnología avanzada. Equipado con sistema de seguridad Toyota Safety Sense, pantalla táctil de 9 pulgadas y asientos de piel.',
      imagenes: JSON.stringify(['/images/camry.jpg']),
      destacado: true,
    },
    {
      marca: 'Honda',
      modelo: 'CR-V',
      anio: 2024,
      precio: 649000,
      kilometraje: 0,
      tipo: 'suv',
      estado: 'nuevo',
      color: 'Gris',
      transmision: 'automatico',
      combustible: 'hibrido',
      descripcion: 'La Honda CR-V Híbrida ofrece lo mejor en eficiencia y versatilidad. Sistema híbrido e:HEV, amplio espacio interior y tecnología Honda Sensing.',
      imagenes: JSON.stringify(['/images/crv.jpg']),
      destacado: true,
    },
    {
      marca: 'Mazda',
      modelo: 'CX-5',
      anio: 2023,
      precio: 485000,
      kilometraje: 15000,
      tipo: 'suv',
      estado: 'certificado',
      color: 'Rojo',
      transmision: 'automatico',
      combustible: 'gasolina',
      descripcion: 'Mazda CX-5 certificada con garantía extendida. Diseño Kodo, tecnología Skyactiv y sistema i-Activsense de seguridad.',
      imagenes: JSON.stringify(['/images/cx5.jpg']),
      destacado: true,
    },
    {
      marca: 'Volkswagen',
      modelo: 'Jetta',
      anio: 2023,
      precio: 425000,
      kilometraje: 22000,
      tipo: 'sedan',
      estado: 'usado',
      color: 'Negro',
      transmision: 'automatico',
      combustible: 'gasolina',
      descripcion: 'Volkswagen Jetta en excelentes condiciones. Motor TSI turbo, transmisión DSG y equipamiento completo.',
      imagenes: JSON.stringify(['/images/jetta.jpg']),
      destacado: false,
    },
    {
      marca: 'Ford',
      modelo: 'Ranger',
      anio: 2024,
      precio: 785000,
      kilometraje: 0,
      tipo: 'pickup',
      estado: 'nuevo',
      color: 'Azul',
      transmision: 'automatico',
      combustible: 'diesel',
      descripcion: 'Ford Ranger 2024 con motor diésel turbo. Tracción 4x4, capacidad de carga de 1 tonelada y tecnología SYNC 4.',
      imagenes: JSON.stringify(['/images/ranger.jpg']),
      destacado: true,
    },
    {
      marca: 'Nissan',
      modelo: 'Sentra',
      anio: 2022,
      precio: 345000,
      kilometraje: 35000,
      tipo: 'sedan',
      estado: 'usado',
      color: 'Plata',
      transmision: 'automatico',
      combustible: 'gasolina',
      descripcion: 'Nissan Sentra con excelente rendimiento de combustible. Único dueño, servicio de agencia y llantas nuevas.',
      imagenes: JSON.stringify(['/images/sentra.jpg']),
      destacado: false,
    },
    {
      marca: 'Chevrolet',
      modelo: 'Suburban',
      anio: 2023,
      precio: 1250000,
      kilometraje: 18000,
      tipo: 'suv',
      estado: 'certificado',
      color: 'Negro',
      transmision: 'automatico',
      combustible: 'gasolina',
      descripcion: 'Chevrolet Suburban con capacidad para 8 pasajeros. Sistema de entretenimiento trasero, asientos de piel y paquete de remolque.',
      imagenes: JSON.stringify(['/images/suburban.jpg']),
      destacado: true,
    },
    {
      marca: 'Hyundai',
      modelo: 'Tucson',
      anio: 2024,
      precio: 535000,
      kilometraje: 0,
      tipo: 'suv',
      estado: 'nuevo',
      color: 'Verde',
      transmision: 'automatico',
      combustible: 'hibrido',
      descripcion: 'Hyundai Tucson Híbrida con diseño vanguardista. Pantalla panorámica de 10.25", carga inalámbrica y Hyundai SmartSense.',
      imagenes: JSON.stringify(['/images/tucson.jpg']),
      destacado: false,
    },
    {
      marca: 'Kia',
      modelo: 'Sportage',
      anio: 2023,
      precio: 489000,
      kilometraje: 12000,
      tipo: 'suv',
      estado: 'certificado',
      color: 'Blanco',
      transmision: 'automatico',
      combustible: 'gasolina',
      descripcion: 'Kia Sportage con garantía de 7 años. Techo panorámico, sistema de sonido Harman Kardon y asistentes de conducción.',
      imagenes: JSON.stringify(['/images/sportage.jpg']),
      destacado: false,
    },
    {
      marca: 'BMW',
      modelo: 'Serie 3',
      anio: 2022,
      precio: 725000,
      kilometraje: 28000,
      tipo: 'sedan',
      estado: 'usado',
      color: 'Blanco',
      transmision: 'automatico',
      combustible: 'gasolina',
      descripcion: 'BMW Serie 3 330i con paquete M Sport. Motor TwinPower Turbo, navegación profesional y asientos deportivos.',
      imagenes: JSON.stringify(['/images/bmw3.jpg']),
      destacado: true,
    },
  ]

  for (const vehiculo of vehiculos) {
    await prisma.vehiculo.create({ data: vehiculo })
  }

  console.log('Seed completado: Usuario admin y 10 vehículos creados')
  console.log('Email: admin@concesionaria.com')
  console.log('Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
