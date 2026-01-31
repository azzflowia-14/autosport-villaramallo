import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { auth } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url || !url.startsWith('/uploads/vehiculos/')) {
      return NextResponse.json({ error: 'URL invalida' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', url)
    await unlink(filePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Error al eliminar archivo' }, { status: 500 })
  }
}
