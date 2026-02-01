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

### Chatwoot (Gestion de conversaciones)
- **URL interna**: http://autosports-chatwoot:3000
- Conectado a WhatsApp

---

## Chatbot de WhatsApp - Arquitectura

### Flujo del Workflow n8n
```
Webhook (POST /portofino)
    → AI Agent (GPT-4.1-mini)
    → HTTP Request (responde a Chatwoot)
```

### Componentes
1. **Webhook1**: Recibe mensajes de Chatwoot
2. **AI Agent**: Procesa con GPT-4.1-mini + system prompt
3. **Simple Memory**: Memoria por numero de telefono del cliente
4. **Respuesta 7**: Envia respuesta de vuelta a Chatwoot

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
- [ ] **URGENTE**: Actualizar link de formulario de tasacion (actualmente dice "https://google.com [EDITAR CON LINK REAL]")
- [ ] Agregar herramientas/tools para consultar stock de autos desde la web
- [ ] Mejorar respuestas con info dinamica de vehiculos disponibles

### Web
- (agregar pendientes de la web aqui)

---

## Notas de Sesiones Anteriores

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
