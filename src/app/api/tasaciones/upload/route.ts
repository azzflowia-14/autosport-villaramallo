import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 10

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se recibieron archivos' },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Máximo ${MAX_FILES} fotos permitidas` },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []
    const errors: string[] = []

    for (const file of files) {
      // Validar tipo
      if (file.type && !ALLOWED_TYPES.includes(file.type)) {
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext || '')) {
          errors.push(`${file.name}: Tipo de archivo no permitido`)
          continue
        }
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Archivo muy grande (max 10MB)`)
        continue
      }

      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        const dataUri = `data:${file.type || 'image/jpeg'};base64,${base64}`

        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'concesionaria/tasaciones',
          transformation: [
            { width: 1200, height: 900, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        })

        uploadedUrls.push(result.secure_url)
      } catch (uploadError) {
        console.error('Error subiendo a Cloudinary:', uploadError)
        errors.push(`${file.name}: Error al subir`)
      }
    }

    return NextResponse.json({
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Error al subir archivos' },
      { status: 500 }
    )
  }
}
