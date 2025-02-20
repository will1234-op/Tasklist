// List of available sound files
const soundFiles = {
  General: [
    '11L-sound_bite_of_a_smal-1739548796939.mp3',
    '11L-sound_bite_of_a_smal-1739548802550.mp3',
    '11L-sound_bite_of_a_smal-1739548809525.mp3',
    '11L-sound_bite_of_a_smal-1739548814038.mp3',
    '11L-sound_bite_of_a_smal-1739548816879.mp3'
  ],
  Priority: [
    '11L-A_bright_jackpot_fan-1739548842465.mp3',
    '11L-A_bright_jackpot_fan-1739548889270.mp3',
    '11L-A_bright_jackpot_fan-1739548892562.mp3',
    '11L-A_bright_jackpot_fan-1739548896679.mp3',
    '11L-A_bright_jackpot_fan-1739548900129.mp3'
  ]
}

// Function to get a random sound file
function getRandomSound(isPriority: boolean): string | null {
  try {
    const folder = isPriority ? 'Priority' : 'General'
    const files = soundFiles[folder]
    
    if (!files || files.length === 0) {
      console.log('No sound files available in folder:', folder)
      return null
    }

    const randomIndex = Math.floor(Math.random() * files.length)
    const filename = files[randomIndex]
    
    console.log('Selected sound file:', filename, 'from folder:', folder)
    return `/sounds/${folder}/${filename}`
  } catch (error) {
    console.error('Error getting sound files:', error)
    return null
  }
}

// Sound effects for the app
let audioContext: AudioContext | null = null

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

// Play a sound from the general folder
export const playGeneralSound = async () => {
  try {
    const soundPath = getRandomSound(false)
    if (!soundPath) {
      console.error('No sound file available')
      return
    }

    const context = initAudioContext()
    console.log('Loading sound from:', soundPath)
    const response = await fetch(soundPath)
    if (!response.ok) {
      throw new Error(`Failed to load sound: ${response.status} ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await context.decodeAudioData(arrayBuffer)
    const source = context.createBufferSource()
    source.buffer = audioBuffer
    source.connect(context.destination)
    source.start(0)
    console.log('Sound played successfully')
  } catch (error) {
    console.error('Failed to play sound:', error)
  }
}

// Function to play a completion sound
export async function playTaskCompletionSound(isPriority: boolean) {
  try {
    const soundPath = getRandomSound(isPriority)
    if (!soundPath) {
      console.log('No sound path available')
      return
    }

    console.log('Attempting to play sound from:', soundPath)
    const audio = new Audio(soundPath)
    
    // Add more detailed error logging
    audio.onerror = (e) => {
      console.error('Audio error:', {
        error: e,
        code: audio.error?.code,
        message: audio.error?.message,
        path: soundPath
      })
    }

    // Ensure the audio is loaded before playing
    await new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio loaded successfully')
        resolve(true)
      })
      
      audio.addEventListener('error', (e) => {
        const error = {
          code: audio.error?.code,
          message: audio.error?.message,
          path: soundPath
        }
        console.error('Error loading audio:', error)
        reject(error)
      })
      
      console.log('Loading audio...')
      audio.load()
    })

    console.log('Starting playback...')
    await audio.play()
    console.log('Playback started successfully')
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}
