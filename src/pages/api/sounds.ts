import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { folder } = req.query
    
    if (!folder || !['General', 'Priority'].includes(folder as string)) {
      return res.status(400).json({ error: 'Invalid folder' })
    }

    const soundsDir = path.join(process.cwd(), 'public', 'sounds', folder as string)
    
    // Check if directory exists
    if (!fs.existsSync(soundsDir)) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    // Get all sound files
    const files = fs.readdirSync(soundsDir)
    const soundFiles = files.filter(file => 
      ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase())
    )

    return res.status(200).json(soundFiles)
  } catch (error) {
    console.error('Error getting sounds:', error)
    return res.status(500).json({ error: 'Failed to get sounds' })
  }
}
