"use client"

import { useEffect, useRef, useState } from "react"
import Matter from "matter-js"

export default function CoinDrop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine>()
  const [coinCount, setCoinCount] = useState(0)

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    // Setup Matter.js engine
    const engine = Matter.Engine.create()
    engineRef.current = engine

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        background: "white",
        wireframes: false,
      },
    })

    // Create walls
    const wallOptions = {
      isStatic: true,
      render: {
        fillStyle: "transparent",
      },
    }

    const walls = [
      // Bottom
      Matter.Bodies.rectangle(
        containerRef.current.clientWidth / 2,
        containerRef.current.clientHeight,
        containerRef.current.clientWidth,
        50,
        wallOptions,
      ),
      // Left
      Matter.Bodies.rectangle(
        -25,
        containerRef.current.clientHeight / 2,
        50,
        containerRef.current.clientHeight,
        wallOptions,
      ),
      // Right
      Matter.Bodies.rectangle(
        containerRef.current.clientWidth + 25,
        containerRef.current.clientHeight / 2,
        50,
        containerRef.current.clientHeight,
        wallOptions,
      ),
    ]

    Matter.Composite.add(engine.world, walls)

    // Create a runner
    const runner = Matter.Runner.create()

    // Run the engine
    Matter.Runner.run(runner, engine)
    Matter.Render.run(render)

    // Cleanup
    return () => {
      Matter.Render.stop(render)
      Matter.Runner.stop(runner)
      Matter.Engine.clear(engine)
    }
  }, [])

  const handleDropCoin = () => {
    if (!engineRef.current || !containerRef.current) return

    const coinSize = 45 // 50% smaller than the previous 90
    const coin = Matter.Bodies.circle(
      containerRef.current.clientWidth / 2,
      0, // Drop from just above the top
      coinSize / 2, // Radius is half of the size
      {
        restitution: 0.4,
        friction: 0.03,
        density: 0.001,
        render: {
          sprite: {
            texture: createCoinTexture(coinSize),
            xScale: 1,
            yScale: 1,
          },
        },
        collisionFilter: {
          group: 0,
          category: 0x0001,
          mask: 0x0001,
        },
        plugin: {
          attractors: [
            (bodyA: Matter.Body, bodyB: Matter.Body) => {
              return {
                x: (bodyA.position.x - bodyB.position.x) * 1e-6,
                y: (bodyA.position.y - bodyB.position.y) * 1e-6,
              }
            },
          ],
        },
      },
    )

    // Scale the coin to 90% of its size to allow for overlap
    Matter.Body.scale(coin, 0.9, 0.9)

    // Add some random rotation and horizontal velocity
    Matter.Body.setAngularVelocity(coin, (Math.random() - 0.5) * 0.2)
    Matter.Body.setVelocity(coin, { x: (Math.random() - 0.5) * 2, y: 1 })

    Matter.Composite.add(engineRef.current.world, coin)
    setCoinCount((prev) => prev + 1)
  }

  const createCoinTexture = (size: number) => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    // Draw gold circle
    ctx.fillStyle = "#FFD700"
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw purple diamond
    ctx.fillStyle = "#800080"
    ctx.beginPath()
    ctx.moveTo(size / 2, size / 4)
    ctx.lineTo((size * 3) / 4, size / 2)
    ctx.lineTo(size / 2, (size * 3) / 4)
    ctx.lineTo(size / 4, size / 2)
    ctx.closePath()
    ctx.fill()

    return canvas.toDataURL()
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div
        ref={containerRef}
        className="relative w-full bg-white border rounded-lg shadow-lg"
        style={{ height: "600px" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleDropCoin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Drop Coin
        </button>
        <div className="text-lg font-medium">Coins: {coinCount}</div>
      </div>
    </div>
  )
}

