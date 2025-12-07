'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SlotMachineRevealProps {
  participantName: string
  assignedToName: string
  allNames: string[]
  token: string
}

export function SlotMachineReveal({
  participantName,
  assignedToName,
  allNames,
  token,
}: SlotMachineRevealProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentName, setCurrentName] = useState('')
  const [hasSeenBefore, setHasSeenBefore] = useState(false)

  useEffect(() => {
    // Check if user has seen this before
    const seenKey = `revealed_${token}`
    const hasSeen = localStorage.getItem(seenKey) === 'true'
    setHasSeenBefore(hasSeen)

    if (!hasSeen) {
      // Start animation
      startAnimation()
      // Mark as seen
      localStorage.setItem(seenKey, 'true')
    } else {
      // Show directly
      setCurrentName(assignedToName)
    }
  }, [token, assignedToName])

  function startAnimation() {
    setIsAnimating(true)

    // Slot machine effect: cycle through names
    const shuffledNames = [...allNames].sort(() => Math.random() - 0.5)
    let index = 0

    // Animation phases with increasing delays
    const speeds = [80, 80, 80, 80, 100, 100, 120, 140, 160, 200, 250, 300, 400]

    function showNextName() {
      if (index >= speeds.length) {
        // Animation complete - show final name
        setTimeout(() => {
          setCurrentName(assignedToName)
          setIsAnimating(false)
        }, 300)
        return
      }

      setCurrentName(shuffledNames[index % shuffledNames.length])
      index++

      // Schedule next iteration with increasing delay
      setTimeout(showNextName, speeds[index - 1] || 80)
    }

    // Start the animation
    showNextName()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-christmas-red to-christmas-red-light p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white mb-8"
      >
        <h1 className="text-5xl font-bold mb-4">🎄 Wichteln 2025</h1>
        <p className="text-xl">Hallo {participantName}!</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        <p className="text-center text-gray-700 text-lg mb-6 font-medium">Du beschenkst:</p>

        <div className="relative h-32 flex items-center justify-center overflow-hidden bg-christmas-red-light rounded-xl border-4 border-white mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentName}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: isAnimating ? 0.1 : 0.3 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-white">{currentName || '...'}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 0 : 1 }}
          transition={{ delay: 2.5 }}
          className="text-center"
        >
          {!isAnimating && (
            <>
              <div className="text-6xl mb-4">🎁</div>
              <p className="text-gray-600 text-sm">
                Denk dran: Es bleibt geheim bis zur Weihnachtsfeier! 🤫
              </p>
            </>
          )}
        </motion.div>
      </motion.div>

      {hasSeenBefore && !isAnimating && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white text-sm mt-4"
        >
          (Du hast diese Zuteilung bereits gesehen)
        </motion.p>
      )}
    </div>
  )
}
