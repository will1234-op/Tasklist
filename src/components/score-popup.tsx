import { motion } from 'framer-motion'

interface ScorePopupProps {
  score: number
  x: number
  y: number
  onComplete: () => void
}

export function ScorePopup({ score, x, y, onComplete }: ScorePopupProps) {
  return (
    <motion.div
      className="absolute text-2xl font-bold text-white"
      initial={{ opacity: 0, y, x }}
      animate={{ opacity: 1, y: y - 50, x }}
      exit={{ opacity: 0, y: y - 100 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onAnimationComplete={onComplete}
    >
      +{score}
    </motion.div>
  )
}
