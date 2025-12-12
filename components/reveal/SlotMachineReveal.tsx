'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer } from '@/components/layout/Footer'
import { WichtelIcon } from '@/components/icons/WichtelIcon'
import { useTranslations } from 'next-intl'

interface SlotMachineRevealProps {
  participantName: string
  assignedToName: string
  allNames: string[]
  sessionName: string
  token: string
}

export function SlotMachineReveal({
  participantName,
  assignedToName,
  allNames,
  sessionName,
  token,
}: SlotMachineRevealProps) {
  const t = useTranslations('reveal')
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentName, setCurrentName] = useState('')
  // Check localStorage immediately during initialization
  const [wasSeenBeforePageLoad] = useState(() => {
    const seenKey = `revealed_${token}`
    return localStorage.getItem(seenKey) === 'true'
  })

  useEffect(() => {
    const seenKey = `revealed_${token}`

    if (!wasSeenBeforePageLoad) {
      // First time - show animation
      startAnimation()
      // Mark as seen for future visits
      localStorage.setItem(seenKey, 'true')
    } else {
      // Already seen before - show directly without animation
      setCurrentName(assignedToName)
    }
  }, [token, assignedToName, wasSeenBeforePageLoad])

  function startAnimation() {
    setIsAnimating(true)

    // Funny fictional Christmas characters
    const funnyNames = [
      t('funnyNames.santa'),
      t('funnyNames.elf'),
      t('funnyNames.snowman'),
      t('funnyNames.reindeer'),
      t('funnyNames.angelElf'),
      t('funnyNames.angel'),
      t('funnyNames.star'),
      t('funnyNames.bell'),
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

// 40, 40, 40, 40, 40, 40,          // Fast start           + (6x40 = 240ms)
// 60, 60, 60, 60,                  // Medium (4x60          +  = 240ms)
// 80, 80, 80,                      // Slower (3x80          +  = 240ms)
// 100, 100, 100,                   // Even slower           + (3x100 = 300ms)
// 120, 120, 120,                   // Slowing down          +  (3x120 = 360ms)
// 150, 150,                        // Much slower           + (2x150 = 300ms)
// 200, 200,                        // Very slow           + (2x200 = 400ms)
// 300,                             // Nearly           + stopping (1x300 = 300ms)
// 400,                             // Final slow           + (1x400 = 400ms)
// ]
// Total: ~2580ms ≈ 2.6 seconds


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
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6"
      >
        <Image
          src="/logo-full.png"
          alt="Wichtel App"
          width={80}
          height={0}
          priority
          className="drop-shadow-2xl"
          style={{ height: 'auto', width: 'auto' }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center text-white mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">
          {sessionName}
        </h1>
        <p className="text-xl">{t('greeting', { participantName })}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card-strong rounded-2xl p-8 max-w-md w-full"
      >
        <p className="text-center text-gray-700 text-lg mb-6 font-medium">{t('label')}</p>

        <div className="relative h-32 flex items-center justify-center overflow-hidden bg-christmas-red-light rounded-xl border-4 border-white mb-6">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentName}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{
                duration: 0.05,
                ease: "linear"
              }}
              layout
              className="absolute text-center"
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
              <div className="mb-4 flex justify-center">
                <WichtelIcon name="gift" size={64} className="text-christmas-red" />
              </div>
              <p className="text-gray-600 text-sm">
                {t('reminder')}
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
          {t('alreadySeen')}
        </motion.p>
      )}
    </div>
    <Footer />
    </div>
  )
}
