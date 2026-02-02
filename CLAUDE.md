# Autosport Villa Ramallo - Contexto del Proyecto

## Descripcion General
Sitio web de concesionaria de autos (Next.js) + Chatbot de WhatsApp (n8n + Chatwoot).

## Infraestructura

### Web (Este Repo)
- **Framework**: Next.js
- **Deploy**: Vercel
- **URL**: https://autosport-villaramallo.vercel.app/
- **Imagenes**: Cloudinary

### n8n (Chatbot)
- **URL**: https://autosports-n8n.bdgnn2.easypanel.host/
- **Host**: VPS Hostinger con Easypanel
- **Workflow principal**: "Autosports Main" (ID: -j4TYKEzYx5dlFwWBEGBq)
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZDU5MTM3OC04YjY1LTRmMmEtYWM4Mi1kMjYxNjU1YzRkMzUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY5ODk3NTQ3LCJleHAiOjE3NzI0Mjc2MDB9.M5rhU4vtnm0TK--sPUF5ydexv3Z2mGkcWAuQ-Yg8CR0`

### Chatwoot (Gestion de conversaciones)
- **URL interna**: http://autosports-chatwoot:3000
- Conectado a WhatsApp

---

## Chatbot de WhatsApp - Arquitectura

### Flujo del Workflow n8n
```
Webhook1 (POST /portofino)
    → Obtener Stock (GET /api/vehiculos/stock)
    → AI Agent (GPT-4.1-mini)
    → Respuesta Chatwoot
```

### Componentes
1. **Webhook1**: Recibe mensajes de Chatwoot
2. **Obtener Stock**: Consulta el stock de vehiculos desde la API de Vercel
3. **AI Agent**: Procesa con GPT-4.1-mini + system prompt (incluye stock)
4. **Simple Memory**: Memoria por numero de telefono del cliente
5. **Respuesta Chatwoot**: Envia respuesta de vuelta a Chatwoot

### Modelo
- GPT-4.1-mini (OpenAI)

### Input del mensaje
```
{{ $json.body.conversation.messages[0].processed_message_content }}
```

### Session Key (memoria)
```
{{ $json.body.conversation.messages[0].sender.phone_number }}
```

### Nodo: Obtener Stock
- **Tipo**: HTTP Request (no es tool, se ejecuta siempre)
- **Endpoint**: `https://autosport-villaramallo.vercel.app/api/vehiculos/stock`
- **Metodo**: GET
- El stock se inyecta en el system prompt del AI Agent
- El AI siempre tiene acceso al stock actualizado en cada mensaje

---

## System Prompt Actual del Chatbot

El bot se presenta como "Autosport Villa Ramallo" con tono amigable e informal (voseo argentino).

### Informacion de la Concesionaria
- **Ubicacion**: Av. J. Newbery 345, Villa Ramallo, Buenos Aires
- **WhatsApp**: +54 9 3407 51-0895
- **Web**: https://autosport-villaramallo.vercel.app/
- **Horarios**: Lun-Vie 8-12 y 16-20, Sab/Feriados 8:30-12:30

### Servicios
- Venta de 0KM (representantes de BYD)
- Venta de usados con garantia
- Financiacion via CreditCar (cuotas fijas en pesos)
- Tasacion de usados

### Lo que puede hacer el bot
- Informar sobre vehiculos y precios
- Explicar proceso de compra y financiacion
- Dar info de contacto, ubicacion, horarios
- Enviar link de formulario de tasacion
- Dirigir a la web para catalogo

### Lo que NO puede hacer
- Agendar turnos
- Dar descuentos o negociar
- Prometer disponibilidad
- Cerrar ventas o tomar senas
- Dar valores de tasacion

### Derivacion a Ana (humana)
Deriva cuando el cliente:
- Quiere negociar precio
- Quiere cerrar compra o dejar sena
- Tiene reclamo o problema
- Pide hablar con persona
- Preguntas muy especificas

---

## Pendientes / TODO

### Chatbot
- [x] ~~**URGENTE**: Actualizar link de formulario de tasacion~~ (Completado 2026-02-02 - ahora apunta a /cotizar)
- [x] ~~Agregar herramientas/tools para consultar stock de autos desde la web~~ (Completado 2026-02-01)
- [x] ~~Mejorar respuestas con info dinamica de vehiculos disponibles~~ (Completado 2026-02-01)

### Web
- [x] ~~Cambiar boton "Solicitar cotizacion" a "Financiacion" en detalle vehiculo~~ (Completado 2026-02-02)

---

## Notas de Sesiones Anteriores

### 2026-02-02
- Se corrigieron los links en el prompt de n8n:
  - Simular cuota: `/cotizar` → `/financiar`
  - Formulario tasacion: `/tasacion` → `/cotizar`
- Se cambio el boton "Solicitar cotizacion" a "Financiacion" en la pagina de detalle del vehiculo

### 2026-02-01
- Se creo endpoint `/api/vehiculos/stock` para consultar stock desde n8n
- Se agrego nodo "Obtener Stock" antes del AI Agent (no como tool, sino HTTP Request directo)
- El stock se inyecta en el system prompt - el bot siempre sabe que autos hay
- El bot ahora responde con info real del stock en tiempo real

### 2026-01-31
- Se trabajo en el prompt del chatbot
- Se configuro el workflow basico con GPT-4.1-mini
- Se integro con Chatwoot para WhatsApp

---

## Comandos Utiles

### Consultar workflows via API
```bash
curl -s -H "X-N8N-API-KEY: <API_KEY>" "https://autosports-n8n.bdgnn2.easypanel.host/api/v1/workflows"
```

### Actualizar workflow via API
```bash
curl -X PATCH -H "X-N8N-API-KEY: <API_KEY>" -H "Content-Type: application/json" \
  "https://autosports-n8n.bdgnn2.easypanel.host/api/v1/workflows/<WORKFLOW_ID>" \
  -d '{ "nodes": [...] }'
```
