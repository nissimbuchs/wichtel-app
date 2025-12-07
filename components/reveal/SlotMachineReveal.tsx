'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer } from '@/components/layout/Footer'

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
  const [wasSeenBeforePageLoad, setWasSeenBeforePageLoad] = useState(false)

  useEffect(() => {
    // Check if user has seen this before (BEFORE page load)
    const seenKey = `revealed_${token}`
    const hasSeen = localStorage.getItem(seenKey) === 'true'

    if (!hasSeen) {
      // First time - show animation
      setWasSeenBeforePageLoad(false)
      startAnimation()
      // Mark as seen for future visits
      localStorage.setItem(seenKey, 'true')
    } else {
      // Already seen before - show directly without animation
      setWasSeenBeforePageLoad(true)
      setCurrentName(assignedToName)
    }
  }, [token, assignedToName])

  function startAnimation() {
    setIsAnimating(true)

    // Funny fictional Christmas characters
    const funnyNames = [
      '🎅 Weihnachtsmann',
      '🧝 Wichtel Willi',
      '☃️ Schneemann Olaf',
      '🦌 Rentier Rudolph',
      '🧝‍♀️ Elfe Ella',
      '👼 Engel Gabriel',
      '🌟 Sternchen',
      '🔔 Glöckchen',
    ]

    // Mix real names with funny names for animation
    const allNamesForAnimation = [...allNames, ...funnyNames]
    const shuffledNames = allNamesForAnimation.sort(() => Math.random() - 0.5)
    let index = 0

    // Animation phases with increasing delays (total ~6 seconds)
    const speeds = [
      60, 60, 60, 60, 60, 60, 60, 60,  // Fast start (8x60 = 480ms)
      80, 80, 80, 80, 80, 80,          // Medium (6x80 = 480ms)
      100, 100, 100, 100, 100,         // Slower (5x100 = 500ms)
      120, 120, 120, 120,              // Even slower (4x120 = 480ms)
      150, 150, 150, 150,              // Slowing down (4x150 = 600ms)
      200, 200, 200,                   // Much slower (3x200 = 600ms)
      250, 250, 250,                   // Very slow (3x250 = 750ms)
      350, 350,                        // Nearly stopping (2x350 = 700ms)
      500, 500,                        // Almost there (2x500 = 1000ms)
      700,                             // Final slow (1x700 = 700ms)
    ]

    function showNextName() {
      if (index >= speeds.length) {
        // Animation complete - show final name (always the REAL assigned name)
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-christmas-red to-christmas-red-light">
    <div className="flex-1 flex flex-col items-center justify-center p-4">
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

      {wasSeenBeforePageLoad && !isAnimating && (
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
    <Footer />
    </div>
  )
}
