"use client"

import { useEffect, useRef, useState } from "react"
import Matter from "matter-js"
import { Input } from "@/components/ui/input"

export default function ShapeDrop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine>()
  const [shapeCount, setShapeCount] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [intervalMinutes, setIntervalMinutes] = useState("2")
  const timerRef = useRef<NodeJS.Timeout>()
  const lastDropRef = useRef(0)

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

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !render.canvas) return

      // Update canvas size
      render.canvas.width = containerRef.current.clientWidth
      render.canvas.height = containerRef.current.clientHeight

      // Update bounds
      render.bounds.max.x = containerRef.current.clientWidth
      render.bounds.max.y = containerRef.current.clientHeight

      // Update walls
      Matter.Composite.clear(engine.world, false)
      const walls = [
        // Bottom
        Matter.Bodies.rectangle(
          containerRef.current.clientWidth / 2,
          containerRef.current.clientHeight,
          containerRef.current.clientWidth,
          50,
          { isStatic: true, render: { fillStyle: "transparent" } },
        ),
        // Left
        Matter.Bodies.rectangle(-25, containerRef.current.clientHeight / 2, 50, containerRef.current.clientHeight, {
          isStatic: true,
          render: { fillStyle: "transparent" },
        }),
        // Right
        Matter.Bodies.rectangle(
          containerRef.current.clientWidth + 25,
          containerRef.current.clientHeight / 2,
          50,
          containerRef.current.clientHeight,
          { isStatic: true, render: { fillStyle: "transparent" } },
        ),
      ]
      Matter.Composite.add(engine.world, walls)
    }

    // Initial walls setup
    handleResize()

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Create a runner
    const runner = Matter.Runner.create()

    // Run the engine
    Matter.Runner.run(runner, engine)
    Matter.Render.run(render)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      Matter.Render.stop(render)
      Matter.Runner.stop(runner)
      Matter.Engine.clear(engine)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1
          const intervalInSeconds = Number.parseFloat(intervalMinutes) * 60

          // Check if we should drop a shape
          if (intervalInSeconds > 0 && newTime >= lastDropRef.current + intervalInSeconds) {
            lastDropRef.current = newTime
            handleDropShape()
          }

          return newTime
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isTimerRunning, intervalMinutes])

  const handleDropShape = () => {
    if (!engineRef.current || !containerRef.current) return

    const shapeSize = 45
    const isCircle = Math.random() < 0.5

    let shape
    if (isCircle) {
      shape = Matter.Bodies.circle(containerRef.current.clientWidth / 2, 0, shapeSize / 2, {
        restitution: 0.4,
        friction: 0.03,
        density: 0.001,
        render: {
          sprite: {
            texture: createShapeTexture(shapeSize, true),
            xScale: 1,
            yScale: 1,
          },
        },
      })
    } else {
      shape = Matter.Bodies.polygon(containerRef.current.clientWidth / 2, 0, 4, shapeSize / 2, {
        restitution: 0.4,
        friction: 0.03,
        density: 0.001,
        render: {
          sprite: {
            texture: createShapeTexture(shapeSize, false),
            xScale: 1,
            yScale: 1,
          },
        },
      })
    }

    Matter.Body.setAngle(shape, Math.random() * Math.PI)

    shape.collisionFilter = {
      group: 0,
      category: 0x0001,
      mask: 0x0001,
    }

    shape.plugin = {
      attractors: [
        (bodyA: Matter.Body, bodyB: Matter.Body) => {
          return {
            x: (bodyA.position.x - bodyB.position.x) * 1e-6,
            y: (bodyA.position.y - bodyB.position.y) * 1e-6,
          }
        },
      ],
    }

    Matter.Body.scale(shape, 0.9, 0.9)
    Matter.Body.setAngularVelocity(shape, (Math.random() - 0.5) * 0.2)
    Matter.Body.setVelocity(shape, { x: (Math.random() - 0.5) * 2, y: 1 })

    Matter.Composite.add(engineRef.current.world, shape)
    setShapeCount((prev) => prev + 1)
  }

  const createShapeTexture = (size: number, isCircle: boolean) => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    if (isCircle) {
      ctx.fillStyle = "#FFD700"
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#800080"
      ctx.beginPath()
      ctx.moveTo(size / 2, size / 4)
      ctx.lineTo((size * 3) / 4, size / 2)
      ctx.lineTo(size / 2, (size * 3) / 4)
      ctx.lineTo(size / 4, size / 2)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.fillStyle = "#800080"
      ctx.beginPath()
      ctx.moveTo(size / 2, 0)
      ctx.lineTo(size, size / 2)
      ctx.lineTo(size / 2, size)
      ctx.lineTo(0, size / 2)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = "#FFD700"
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2)
      ctx.fill()
    }

    return canvas.toDataURL()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false)
    } else {
      lastDropRef.current = elapsedTime // Reset the last drop time
      setIsTimerRunning(true)
    }
  }

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isNaN(Number(value)) && Number(value) >= 0) {
      setIntervalMinutes(value)
    }
  }

  return (
    <div className="w-full max-w-xs mx-auto p-4 h-screen flex flex-col">
      <div ref={containerRef} className="relative w-full h-[85vh] bg-[#f8f9fa] rounded-xl shadow-md mb-4">
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleDropShape}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Drop Shape
          </button>
          <div className="text-lg font-medium">Shapes: {shapeCount}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="number"
              min="0"
              step="0.5"
              value={intervalMinutes}
              onChange={handleIntervalChange}
              placeholder="Interval (minutes)"
              className="w-full"
            />
          </div>
          <button
            onClick={toggleTimer}
            className={`px-4 py-2 rounded transition-colors ${
              isTimerRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } text-white`}
          >
            {isTimerRunning ? "Stop" : "Start"}
          </button>
          <div className="text-lg font-medium w-20 text-center">{formatTime(elapsedTime)}</div>
        </div>
      </div>
    </div>
  )
}

