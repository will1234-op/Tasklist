import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { playGeneralSound } from '@/lib/sound'
import planck from 'planck-js'
import { motion, AnimatePresence } from 'framer-motion'

interface ScoreAnimation {
  id: number
  score: number
  x: number
  y: number
}

interface CoinDropProps {
  isPriority?: boolean
  onDrop?: (score: number) => void
}

export function CoinDrop({ isPriority = false, onDrop }: CoinDropProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<planck.World | null>(null)
  const coinsRef = useRef<planck.Body[]>([])
  const [engineReady, setEngineReady] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [scoreAnimations, setScoreAnimations] = useState<ScoreAnimation[]>([])

  useEffect(() => {
    const world = planck.World({
      gravity: planck.Vec2(0, 25)
    })

    // Ground
    const ground = world.createBody({
      type: 'static',
      position: planck.Vec2(225, 580)
    })
    ground.createFixture({
      shape: planck.Box(200, 20),
      friction: 0.9,     // High friction for dramatic impacts
      restitution: 0.2   // Very low bounce
    })
    ground.setUserData('bottom')

    // Left wall
    const leftWall = world.createBody({
      type: 'static',
      position: planck.Vec2(25, 300)
    })
    leftWall.createFixture({
      shape: planck.Box(10, 300)
    })

    // Right wall
    const rightWall = world.createBody({
      type: 'static',
      position: planck.Vec2(425, 300)
    })
    rightWall.createFixture({
      shape: planck.Box(10, 300)
    })

    worldRef.current = world
    setEngineReady(true)

    // Setup canvas
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 450
    canvas.height = 600

    // Handle collisions
    world.on('begin-contact', (contact) => {
      const bodyA = contact.getFixtureA().getBody()
      const bodyB = contact.getFixtureB().getBody()

      // Check if coin hits bottom
      if (bodyA.getUserData() === 'coin' && bodyB.getUserData() === 'bottom') {
        const velocity = bodyA.getLinearVelocity()
        const position = bodyA.getPosition()

        // Only trigger on first bounce with significant downward velocity
        if (velocity.y < -2) {
          playGeneralSound()
        }
      }
    })

    // Animation loop
    const animate = () => {
      if (!ctx || !worldRef.current) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Step physics
      worldRef.current.step(1 / 60)

      // Draw walls
      ctx.fillStyle = '#71717a'
      ctx.fillRect(0, 570, 450, 20) // Ground
      ctx.fillRect(0, 0, 20, 600)   // Left wall
      ctx.fillRect(430, 0, 20, 600) // Right wall

      // Draw coins
      ctx.fillStyle = '#FFD700'
      coinsRef.current.forEach(coin => {
        const pos = coin.getPosition()
        const angle = coin.getAngle()

        ctx.save()
        ctx.translate(pos.x, pos.y)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.arc(0, 0, 15, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (worldRef.current) {
        coinsRef.current.forEach(coin => {
          worldRef.current?.destroyBody(coin)
        })
        coinsRef.current = []
      }
    }
  }, [engineReady])

  const dropCoin = () => {
    if (!worldRef.current || !engineReady) return

    // Create a new coin
    const coin = worldRef.current.createDynamicBody({
      position: planck.Vec2(225 + (Math.random() * 30 - 15), 50),
      angle: Math.random() * Math.PI * 2,
    })

    coin.setUserData('coin')

    coin.createFixture({
      shape: planck.Circle(15),
      density: 2.0,
      friction: 0.19,       // Reduced for more sliding
      restitution: 0.45     // Increased bounce
    })

    // Add initial velocity
    coin.setLinearVelocity(planck.Vec2(Math.random() * 4 - 2, 2))
    coin.setAngularVelocity(Math.random() * 2 - 1)

    coinsRef.current.push(coin)
    
    // Play sound
    playGeneralSound()
    
    // Add score animation immediately when dropping coin
    const score = isPriority ? 1000 : 500
    setTotalScore(prev => prev + score)
    const id = Date.now()
    setScoreAnimations(prev => [...prev, { id, score, x: 0, y: 300 }])
    
    // Notify parent of score
    onDrop?.(score)
    
    // Remove animation after delay
    setTimeout(() => {
      setScoreAnimations(prev => prev.filter(popup => popup.id !== id))
    }, 500)
  }

  return (
    <div className="flex h-full gap-4 pb-4">
      <div
        ref={containerRef}
        className="w-[450px] flex-shrink-0 coin-drop"
      >
        <div className="flex h-full flex-col rounded-lg bg-muted/50 p-4">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="font-semibold">Coin Bank</h3>
            <div className="text-4xl font-bold" style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              filter: 'drop-shadow(0 0 2px rgba(255,215,0,0.5))'
            }}>
              {totalScore.toLocaleString()}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={dropCoin}
              disabled={!engineReady}
              data-priority={isPriority}
            >
              Drop Coin
            </Button>
          </div>

          <div className="relative h-[600px] rounded-lg overflow-hidden bg-black/5">
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
            />

            <div className="absolute inset-0 pointer-events-none">
              <AnimatePresence>
                {scoreAnimations.map((popup) => (
                  <motion.div
                    key={popup.id}
                    className="absolute text-2xl font-bold text-white"
                    style={{ 
                      left: '50%', 
                      top: '50%',
                      transform: 'translateX(-50%)',
                      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                    }}
                    initial={{ opacity: 0, y: 0, scale: 1 }}
                    animate={{ opacity: 1, y: -50, scale: 2 }}
                    exit={{ opacity: 0, y: -100, scale: 2 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    +{popup.score}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
