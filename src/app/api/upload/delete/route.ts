import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL invalida' }, { status: 400 })
    }

    // Si es URL de Cloudinary, extraer public_id y eliminar
    if (url.includes('cloudinary.com')) {
      try {
        // Extraer public_id de la URL de Cloudinary
        // Formato: https://res.cloudinary.com/[cloud]/image/upload/v123/folder/filename.ext
        const urlParts = url.split('/')
        const uploadIndex = urlParts.indexOf('upload')
        if (uploadIndex !== -1) {
          // Tomar todo después de 'upload/v123/' y quitar la extensión
          const pathParts = urlParts.slice(uploadIndex + 2) // Saltar 'upload' y 'v123...'
          const fullPath = pathParts.join('/')
          const publicId = fullPath.replace(/\.[^/.]+$/, '') // Quitar extensión

          await cloudinary.uploader.destroy(publicId)
        }
      } catch (cloudinaryError) {
        console.error('Error eliminando de Cloudinary:', cloudinaryError)
        // No fallar si no se puede eliminar de Cloudinary
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Error al eliminar archivo' }, { status: 500 })
  }
}
