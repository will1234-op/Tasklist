"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

type ScorePopup = {
  id: number
  points: number
  x: number
  y: number
}

export default function ScoreAnimation() {
  const [score, setScore] = useState(0)
  const [popups, setPopups] = useState<ScorePopup[]>([])

  const addScore = (points: number) => {
    setScore((prevScore) => prevScore + points)
    const id = Date.now()
    const x = Math.random() * 200 - 100 // Random X position between -100 and 100
    setPopups((prevPopups) => [...prevPopups, { id, points, x, y: 0 }])
    setTimeout(() => {
      setPopups((prevPopups) => prevPopups.filter((popup) => popup.id !== id))
    }, 1000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <h1 className="text-4xl font-bold text-white mb-8">Score: {score}</h1>
      <div className="flex space-x-4">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => addScore(500)}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
        >
          +500 pts
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => addScore(1000)}
          className="bg-green-400 hover:bg-green-500 text-green-900"
        >
          +1000 pts
        </Button>
      </div>
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            className="absolute text-2xl font-bold text-white"
            initial={{ opacity: 0, y: 0, x: popup.x }}
            animate={{ opacity: 1, y: -50, x: popup.x }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            +{popup.points}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

