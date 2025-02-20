import { motion } from 'framer-motion'

interface ScoreAnimationProps {
  score: number
  x: number
  y: number
}

export function ScoreAnimation({ score, x, y }: ScoreAnimationProps) {
  return (
    <motion.div
      className="absolute text-2xl font-bold text-white pointer-events-none"
      style={{ 
        left: x,
        top: y,
        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
      }}
      initial={{ opacity: 0, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: -50, scale: 2 }}
      exit={{ opacity: 0, y: -100, scale: 2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      +{score.toLocaleString()}
    </motion.div>
  )
}
