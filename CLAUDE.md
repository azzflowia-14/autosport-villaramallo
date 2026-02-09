# CLAUDE.md

Este archivo proporciona contexto a Claude Code (claude.ai/code) para trabajar con el codigo de este repositorio.

## Descripcion General
Sitio web de concesionaria de autos "Autosport Emanuel Berdullas" (Next.js 14 App Router) + Chatbot de WhatsApp (n8n + Chatwoot). Deploy en Vercel. Base de datos PostgreSQL con Prisma ORM. Imagenes alojadas en Cloudinary.

## Comandos de Desarrollo

```bash
npm run dev          # Servidor de desarrollo (Next.js)
npm run build        # Build de produccion (incluye prisma generate)
npm run lint         # ESLint
npx prisma studio    # UI para explorar la base de datos
npx prisma migrate dev --name <nombre>  # Crear migracion
npx prisma db seed   # Ejecutar seed (prisma/seed.ts via tsx)
```

## Arquitectura

### Stack
- **Next.js 14** con App Router (`src/app/`)
- **Prisma** con PostgreSQL (schema en `prisma/schema.prisma`, SQLite local `dev.db`)
- **NextAuth v5 beta** con credenciales (`src/lib/auth.ts`)
- **Tailwind CSS** para estilos
- **Cloudinary** para subida de imagenes (`src/lib/cloudinary.ts`)
- **Zod** para validacion

### Rutas publicas
- `/` - Home
- `/catalogo` - Listado de vehiculos con filtros
- `/catalogo/[id]` - Detalle de vehiculo
- `/cotizar` - Formulario de tasacion (el cliente ofrece su auto)
- `/financiar` - Simulador de financiamiento
- `/contacto` - Formulario de contacto

### Panel admin (`/admin/*`)
- `/admin` - Dashboard
- `/admin/vehiculos` - CRUD de vehiculos (incluye importacion desde Excel)
- `/admin/cotizaciones` - Cotizaciones recibidas
- `/admin/mensajes` - Mensajes de contacto
- `/admin/login` - Login

El middleware (`src/middleware.ts`) protege todas las rutas `/admin/*` y `/api/upload/*` requiriendo autenticacion.

### API Routes (`src/app/api/`)
- `vehiculos/route.ts` - CRUD vehiculos
- `vehiculos/[id]/route.ts` - Vehiculo individual
- `vehiculos/stock/` - Endpoint publico que consume el chatbot de n8n para obtener stock en tiempo real
- `vehiculos/importar/` - Importacion masiva desde Excel
- `cotizaciones/`, `mensajes/`, `tasaciones/` - Gestion de formularios
- `upload/` - Subida de imagenes a Cloudinary
- `auth/` - NextAuth handlers

### Modelos de datos (Prisma)
- **Vehiculo** - Autos en stock (imagenes como JSON string de URLs)
- **Cotizacion** - Solicitudes de cotizacion (relacionada a Vehiculo)
- **Tasacion** - Autos que clientes ofrecen para venta/permuta
- **Mensaje** - Mensajes del formulario de contacto
- **Usuario** - Admins del panel

### Variables de entorno requeridas
Ver `.env.example`: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`. Cloudinary usa sus propias env vars (ver `src/lib/cloudinary.ts`).

## Chatbot WhatsApp (externo a este repo)

Workflow n8n que recibe mensajes de Chatwoot, consulta `GET /api/vehiculos/stock` para obtener stock actualizado, y responde usando GPT-4.1-mini. La memoria se mantiene por numero de telefono.

### n8n API
```bash
# Consultar workflows
curl -s -H "X-N8N-API-KEY: <KEY>" "https://autosports-n8n.bdgnn2.easypanel.host/api/v1/workflows"

# Actualizar workflow
curl -X PATCH -H "X-N8N-API-KEY: <KEY>" -H "Content-Type: application/json" \
  "https://autosports-n8n.bdgnn2.easypanel.host/api/v1/workflows/<ID>" \
  -d '{ "nodes": [...] }'
```

### Info de la concesionaria (para el bot)
- Ubicacion: Av. J. Newbery 345, Villa Ramallo, Buenos Aires
- WhatsApp: +54 9 3407 51-0895
- Horarios: Lun-Vie 8-12 y 16-20, Sab/Feriados 8:30-12:30
- Servicios: Venta 0KM (BYD), usados con garantia, financiacion CreditCar, tasaciones
