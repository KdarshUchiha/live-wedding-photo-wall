import { motion } from 'framer-motion'
import type { ReligiousTheme } from '../types'
import styles from './ReligiousAnimations.module.css'

interface Props {
  theme: ReligiousTheme
  color: string
  closeness?: number // 0 = far apart (30+ days), 1 = married (countdown 0)
}

const BASE = import.meta.env.BASE_URL

const THEME_IMAGES: Record<ReligiousTheme, string> = {
  hindu: `${BASE}images/hindu.png`,
  christian: `${BASE}images/christian.png`,
  muslim: `${BASE}images/muslim.png`,
  jewish: `${BASE}images/jewish.png`,
  sikh: `${BASE}images/sikh.png`,
  buddhist: `${BASE}images/buddhist.png`,
  civil: `${BASE}images/civil.png`,
  other: `${BASE}images/other.png`,
}

const THEME_PETALS: Record<ReligiousTheme, string[]> = {
  hindu: ['🌼', '🪔', '🌸', '✨', '🪷'],
  christian: ['🌸', '🕊️', '🌺', '✨', '🌹'],
  muslim: ['⭐', '🌙', '🌿', '✨', '🌺'],
  jewish: ['✡️', '🌹', '⭐', '✨', '🎊'],
  sikh: ['🌸', '🌼', '✨', '🪯', '🌺'],
  buddhist: ['🌸', '🪷', '✨', '🕯️', '🌺'],
  civil: ['🌹', '💫', '✨', '🥂', '🎊'],
  other: ['🌸', '🌹', '💫', '✨', '🌺'],
}

function FallingPetal({ symbol, x, delay, size = 20 }: { symbol: string; x: string; delay: number; size?: number }) {
  return (
    <motion.span
      className={styles.fallingPetal}
      style={{ left: x, fontSize: size }}
      initial={{ y: -40, opacity: 0, rotate: 0 }}
      animate={{ y: '110vh', opacity: [0, 0.85, 0.85, 0], rotate: 360 }}
      transition={{ duration: 7 + delay, delay, repeat: Infinity, ease: 'linear' }}
    >
      {symbol}
    </motion.span>
  )
}

export default function ReligiousAnimations({ theme, closeness = 0.5 }: Props) {
  const imageUrl = THEME_IMAGES[theme] || THEME_IMAGES.other
  const petals = THEME_PETALS[theme] || THEME_PETALS.other

  // When married (closeness=1): image is full center, large
  // When far (closeness=0): image is smaller, lower opacity
  const imageScale = 0.7 + closeness * 0.3
  const imageOpacity = 0.4 + closeness * 0.5

  return (
    <div className={styles.container}>
      {/* Falling petals */}
      {['5%', '15%', '25%', '38%', '50%', '62%', '75%', '85%', '95%'].map((x, i) => (
        <FallingPetal
          key={x}
          symbol={petals[i % petals.length]}
          x={x}
          delay={i * 0.8}
          size={16 + (i % 3) * 4}
        />
      ))}

      {/* Couple image — scales and fades based on closeness */}
      <motion.div
        className={styles.coupleImageWrap}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: imageOpacity, scale: imageScale }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src={imageUrl}
          alt="Bride and Groom"
          className={styles.coupleImage}
          draggable={false}
        />

        {/* Glow effect behind the image */}
        <div className={styles.coupleGlow} />
      </motion.div>

      {/* Hearts burst when close (closeness > 0.6) */}
      {closeness > 0.6 && (
        <div className={styles.heartsBurst}>
          {[0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1].map((delay, i) => (
            <motion.span
              key={i}
              className={styles.heart}
              style={{ left: `${20 + (i * 8)}%` }}
              animate={{
                y: [0, -60, -120],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.7],
                x: [(i % 2 === 0 ? -10 : 10), 0, (i % 2 === 0 ? 10 : -10)],
              }}
              transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: 0.5 }}
            >
              {['❤️', '💕', '✨', '💖', '🤍', '💛', '✨', '💗'][i]}
            </motion.span>
          ))}
        </div>
      )}

      {/* Sparkle particles */}
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={`sparkle-${i}`}
          className={styles.sparkle}
          style={{ left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 25}%` }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  )
}
