// Ajuste puntual 2026-07-27: sincronización con planilla del cliente.
// - Ducati Multistrada 1200 (id 79): precio 45M -> 44M
// - Marca como vendidos los 7 que no figuran en la planilla.
require('dotenv').config({ path: '.env.local' })
process.env.DATABASE_URL = (process.env.DATABASE_URL || '').trim()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const VENDIDOS = [94, 89, 118, 120, 127, 72, 123]
const DUCATI_ID = 79
const DUCATI_PRECIO_NUEVO = 44000000

async function main() {
  const ducati = await prisma.vehiculo.findUnique({ where: { id: DUCATI_ID } })
  if (!ducati) throw new Error(`No existe vehiculo id ${DUCATI_ID}`)
  console.log(`Ducati actual: ${ducati.marca} ${ducati.modelo} ${ducati.anio} - $${ducati.precio.toLocaleString('es-AR')}`)

  if (ducati.precio !== DUCATI_PRECIO_NUEVO) {
    await prisma.$transaction([
      prisma.vehiculo.update({
        where: { id: DUCATI_ID },
        data: { precio: DUCATI_PRECIO_NUEVO },
      }),
      prisma.historialPrecio.create({
        data: {
          vehiculoId: DUCATI_ID,
          campo: 'precio',
          precioAnterior: ducati.precio,
          precioNuevo: DUCATI_PRECIO_NUEVO,
          usuario: 'ajuste-planilla',
        },
      }),
    ])
    console.log(`  -> precio actualizado a $${DUCATI_PRECIO_NUEVO.toLocaleString('es-AR')}`)
  } else {
    console.log('  -> ya tenia ese precio, sin cambios')
  }

  console.log('\nDando de baja (vendidos):')
  for (const id of VENDIDOS) {
    const v = await prisma.vehiculo.findUnique({ where: { id } })
    if (!v) {
      console.log(`  id ${id}: NO EXISTE, salteado`)
      continue
    }
    if (v.estadoStock === 'vendido') {
      console.log(`  id ${id}: ${v.marca} ${v.modelo} ${v.anio} ya estaba vendido, salteado`)
      continue
    }
    await prisma.vehiculo.update({
      where: { id },
      data: { estadoStock: 'vendido', fechaVenta: new Date(), activo: false },
    })
    console.log(`  id ${id}: ${v.marca} ${v.modelo} ${v.anio} -> VENDIDO`)
  }

  const activos = await prisma.vehiculo.count({ where: { activo: true, estadoStock: { not: 'vendido' } } })
  console.log(`\nStock activo restante: ${activos} vehiculos`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
