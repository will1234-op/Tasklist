import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')

    if (!folder || !['General', 'Priority'].includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
    }

    const soundsDir = path.join(process.cwd(), 'public', 'sounds', folder)
    
    // Check if directory exists
    if (!fs.existsSync(soundsDir)) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Get all sound files
    const files = fs.readdirSync(soundsDir)
    const soundFiles = files.filter(file => 
      ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase())
    )

    return NextResponse.json(soundFiles)
  } catch (error) {
    console.error('Error getting sounds:', error)
    return NextResponse.json(
      { error: 'Failed to get sounds' },
      { status: 500 }
    )
  }
}
