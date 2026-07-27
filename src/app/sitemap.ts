import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/negocio'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/financiar`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/cotizar`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  let vehiculos: MetadataRoute.Sitemap = []
  try {
    const activos = await prisma.vehiculo.findMany({
      where: { activo: true },
      select: { id: true, createdAt: true },
    })
    vehiculos = activos.map((v) => ({
      url: `${SITE_URL}/catalogo/${v.id}`,
      lastModified: v.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Si la DB no responde, devolvemos al menos las rutas estáticas
  }

  return [...estaticas, ...vehiculos]
}
