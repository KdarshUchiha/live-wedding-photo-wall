import { motion } from 'framer-motion'
import type { ReligiousTheme } from '../types'
import styles from './ReligiousAnimations.module.css'

interface Props {
  theme: ReligiousTheme
  color: string
  closeness?: number // 0 = far apart (30+ days), 1 = married (countdown 0)
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FloatingSymbol({ symbol, x, y, delay, size = 28, duration = 4 }: {
  symbol: string; x: string; y: string; delay: number; size?: number; duration?: number
}) {
  return (
    <motion.span
      className={styles.floatSymbol}
      style={{ left: x, top: y, fontSize: size }}
      animate={{ y: [-8, 8, -8], opacity: [0.6, 1, 0.6], rotate: [-8, 8, -8] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {symbol}
    </motion.span>
  )
}

function FallingPetal({ symbol, x, delay, size = 20 }: { symbol: string; x: string; delay: number; size?: number }) {
  return (
    <motion.span
      className={styles.fallingPetal}
      style={{ left: x, fontSize: size }}
      initial={{ y: -40, opacity: 0, rotate: 0 }}
      animate={{ y: '110vh', opacity: [0, 0.9, 0.9, 0], rotate: 360 }}
      transition={{ duration: 6 + Math.random() * 3, delay, repeat: Infinity, ease: 'linear' }}
    >
      {symbol}
    </motion.span>
  )
}

// ─── HINDU ────────────────────────────────────────────────────────────────────

function Firecracker({ x, y, delay }: { x: number; y: number; delay: number }) {
  const arms = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
  const colors = ['#FF6B00', '#FFD700', '#FF1744', '#FF6B00', '#FFAB00', '#FF4081', '#FF6B00', '#FFD700', '#FF1744', '#FF6B00', '#FFAB00', '#FF4081']
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.4, delay, repeat: Infinity, repeatDelay: 3.5 }}
    >
      {arms.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <motion.line
            key={i}
            x1={x} y1={y}
            x2={x + Math.cos(rad) * 40}
            y2={y + Math.sin(rad) * 40}
            stroke={colors[i]}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ x2: x, y2: y }}
            animate={{ x2: [x, x + Math.cos(rad) * 55, x + Math.cos(rad) * 40], y2: [y, y + Math.sin(rad) * 55, y + Math.sin(rad) * 40] }}
            transition={{ duration: 1.0, delay: delay + 0.05 * i, repeat: Infinity, repeatDelay: 3.5 }}
          />
        )
      })}
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <motion.circle
            key={`dot-${i}`}
            cx={x + Math.cos(rad) * 48}
            cy={y + Math.sin(rad) * 48}
            r="4"
            fill={colors[i * 2]}
            initial={{ r: 0 }}
            animate={{ r: [0, 5, 0] }}
            transition={{ duration: 1.4, delay: delay + 0.2, repeat: Infinity, repeatDelay: 3.5 }}
          />
        )
      })}
    </motion.g>
  )
}

function HinduCoupleSVG({ color }: { color: string }) {
  const gold = '#FFD700'
  const skin = '#F5C6A0'
  const skinShadow = '#D4956A'
  const red = '#DC143C'
  const hair = '#1a0a00'

  return (
    <svg viewBox="0 0 400 320" className={styles.coupleSvg}>
      {/* ── CHIBI BRIDE (left, facing right) ── */}
      <g transform="translate(60, 40)">
        {/* Hair — long flowing black */}
        <ellipse cx="70" cy="80" rx="52" ry="56" fill={hair}/>
        <path d="M22,90 C18,130 24,200 40,240 L50,240 C38,190 34,130 38,90 Z" fill={hair} opacity="0.8"/>
        <path d="M118,90 C122,130 116,200 100,240 L90,240 C102,190 106,130 102,90 Z" fill={hair} opacity="0.8"/>

        {/* Dupatta draping over head */}
        <path d="M20,55 C30,25 60,12 90,18 C115,22 130,40 128,62 C120,45 100,32 75,30 C50,32 30,48 26,68 C22,60 20,55 20,55 Z" fill={color} opacity="0.85"/>
        <path d="M20,55 C14,80 12,120 18,160 Q24,140 30,120 C28,100 24,80 26,68 Z" fill={color} opacity="0.5"/>
        <path d="M128,62 C134,80 136,110 132,150 Q126,130 120,115 C122,95 124,78 120,62 Z" fill={color} opacity="0.4"/>

        {/* Big chibi head */}
        <ellipse cx="70" cy="85" rx="44" ry="48" fill={skin}/>
        <ellipse cx="70" cy="90" rx="40" ry="44" fill={skin}/>

        {/* Cheek blush */}
        <ellipse cx="45" cy="105" rx="10" ry="6" fill="#FFB6C1" opacity="0.4"/>
        <ellipse cx="95" cy="105" rx="10" ry="6" fill="#FFB6C1" opacity="0.4"/>

        {/* BIG sparkly manhwa eyes — looking right */}
        <ellipse cx="55" cy="92" rx="12" ry="14" fill="white"/>
        <ellipse cx="85" cy="92" rx="12" ry="14" fill="white"/>
        <ellipse cx="59" cy="92" rx="9" ry="11" fill="#3D1F00"/>
        <ellipse cx="89" cy="92" rx="9" ry="11" fill="#3D1F00"/>
        <ellipse cx="61" cy="90" rx="6" ry="7" fill="#1a0a00"/>
        <ellipse cx="91" cy="90" rx="6" ry="7" fill="#1a0a00"/>
        {/* Eye sparkles */}
        <circle cx="57" cy="86" r="3.5" fill="white"/>
        <circle cx="63" cy="94" r="2" fill="white" opacity="0.7"/>
        <circle cx="87" cy="86" r="3.5" fill="white"/>
        <circle cx="93" cy="94" r="2" fill="white" opacity="0.7"/>
        {/* Eyelashes */}
        <path d="M43,82 Q48,78 53,80" stroke={hair} strokeWidth="2" fill="none"/>
        <path d="M73,80 Q78,78 83,82" stroke={hair} strokeWidth="2" fill="none"/>
        <path d="M87,82 Q92,78 97,80" stroke={hair} strokeWidth="2" fill="none"/>

        {/* Small cute nose */}
        <path d="M68,100 Q70,104 72,100" stroke={skinShadow} strokeWidth="1.5" fill="none"/>

        {/* Small smile */}
        <path d="M60,112 Q70,120 80,112" stroke="#c06060" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Bindi — big red dot */}
        <circle cx="70" cy="72" r="5" fill={red}/>
        <circle cx="70" cy="72" r="2.5" fill={gold}/>

        {/* Maang tikka chain */}
        <line x1="70" y1="62" x2="70" y2="45" stroke={gold} strokeWidth="2"/>
        <circle cx="70" cy="43" r="4" fill={gold}/>
        <circle cx="70" cy="43" r="2" fill={red}/>

        {/* Nose ring */}
        <circle cx="72" cy="104" r="4" fill="none" stroke={gold} strokeWidth="2"/>
        <circle cx="72" cy="108" r="1.5" fill={gold}/>

        {/* Necklace */}
        <path d="M45,135 Q70,148 95,135" stroke={gold} strokeWidth="3" fill="none"/>
        <circle cx="70" cy="147" r="4" fill={gold}/>
        <circle cx="60" cy="144" r="2.5" fill={gold}/>
        <circle cx="80" cy="144" r="2.5" fill={gold}/>

        {/* Small chibi body — lehenga */}
        <path d="M45,140 C40,155 35,190 32,240 L108,240 C105,190 100,155 95,140 Q80,134 70,134 Q60,134 45,140 Z" fill={color}/>
        {/* Gold border on lehenga */}
        <path d="M32,232 Q70,244 108,232" stroke={gold} strokeWidth="3" fill="none" opacity="0.7"/>
        <path d="M34,224 Q70,236 106,224" stroke={gold} strokeWidth="1.5" fill="none" opacity="0.4"/>

        {/* Pallu over shoulder */}
        <path d="M95,140 C108,145 115,165 112,200 L105,230 C108,195 110,160 95,140 Z" fill={color} opacity="0.6"/>

        {/* Bangles on left hand */}
        <ellipse cx="30" cy="195" rx="8" ry="4" fill="none" stroke="#FF4500" strokeWidth="3"/>
        <ellipse cx="30" cy="202" rx="8" ry="4" fill="none" stroke={gold} strokeWidth="2"/>
        <ellipse cx="30" cy="209" rx="8" ry="4" fill="none" stroke="#FF4500" strokeWidth="3"/>

        {/* Mehndi hand reaching toward groom */}
        <ellipse cx="30" cy="218" rx="8" ry="7" fill={skin}/>
        <path d="M26,218 Q30,222 34,218" stroke={skinShadow} strokeWidth="0.8" fill="none"/>
      </g>

      {/* ── CHIBI GROOM (right, facing left) ── */}
      <g transform="translate(195, 40)">
        {/* Pagdi / Safa (big chibi turban) */}
        <path d="M20,30 C30,5 65,-5 100,5 C130,12 145,35 140,55 C128,35 105,22 75,20 C50,22 32,38 28,58 C22,48 20,38 20,30 Z" fill={color} opacity="0.95"/>
        {/* Turban layers */}
        <path d="M28,58 C32,48 50,38 75,36 C100,34 120,40 132,52 Q125,60 105,62 Q75,64 45,60 Z" fill={color} opacity="0.5"/>
        <path d="M35,60 Q75,54 115,60" stroke={gold} strokeWidth="2.5" fill="none" opacity="0.7"/>

        {/* Kalgi (feather ornament) */}
        <motion.g animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 2.5, repeat: Infinity }}
          style={{ transformOrigin: '115px 20px' }}>
          <path d="M115,20 C125,8 135,2 130,18 C128,26 122,34 115,38 C112,30 110,22 115,20 Z" fill={gold}/>
          <path d="M115,20 C118,14 122,10 120,18 C119,22 117,26 115,28 Z" fill="white" opacity="0.4"/>
        </motion.g>

        {/* Sehra strings (flower veil) */}
        {[35, 45, 55, 65, 75, 85].map((x, i) => (
          <motion.g key={x}
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.2 + i * 0.1, repeat: Infinity }}>
            <line x1={x} y1={62} x2={x} y2={85} stroke={gold} strokeWidth="1.2" opacity="0.5"/>
            <circle cx={x} cy={85} r="2.5" fill="white" opacity="0.7"/>
          </motion.g>
        ))}

        {/* Big chibi head */}
        <ellipse cx="75" cy="85" rx="44" ry="48" fill={skin}/>
        <ellipse cx="75" cy="90" rx="40" ry="44" fill={skin}/>

        {/* Cheek blush */}
        <ellipse cx="50" cy="108" rx="10" ry="6" fill="#FFB6C1" opacity="0.3"/>
        <ellipse cx="100" cy="108" rx="10" ry="6" fill="#FFB6C1" opacity="0.3"/>

        {/* BIG sparkly manhwa eyes — looking left */}
        <ellipse cx="58" cy="95" rx="12" ry="14" fill="white"/>
        <ellipse cx="92" cy="95" rx="12" ry="14" fill="white"/>
        <ellipse cx="54" cy="95" rx="9" ry="11" fill="#3D1F00"/>
        <ellipse cx="88" cy="95" rx="9" ry="11" fill="#3D1F00"/>
        <ellipse cx="52" cy="93" rx="6" ry="7" fill="#1a0a00"/>
        <ellipse cx="86" cy="93" rx="6" ry="7" fill="#1a0a00"/>
        {/* Eye sparkles */}
        <circle cx="50" cy="89" r="3.5" fill="white"/>
        <circle cx="56" cy="97" r="2" fill="white" opacity="0.7"/>
        <circle cx="84" cy="89" r="3.5" fill="white"/>
        <circle cx="90" cy="97" r="2" fill="white" opacity="0.7"/>
        {/* Eyebrows */}
        <path d="M44,78 Q54,73 64,78" stroke={hair} strokeWidth="2.5" fill="none"/>
        <path d="M82,78 Q92,73 102,78" stroke={hair} strokeWidth="2.5" fill="none"/>

        {/* Confident smile */}
        <path d="M62,115 Q75,124 88,115" stroke="#c06060" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Neck */}
        <rect x="62" y="132" width="26" height="10" rx="6" fill={skin}/>

        {/* Sherwani body */}
        <path d="M45,142 C40,158 36,195 34,250 L116,250 C114,195 110,158 105,142 Q95,136 75,136 Q55,136 45,142 Z" fill={color}/>

        {/* Nehru collar */}
        <path d="M60,138 Q75,132 90,138 Q84,148 75,145 Q66,148 60,138 Z" fill={color} opacity="0.7" stroke={gold} strokeWidth="1"/>

        {/* Gold buttons */}
        {[155, 170, 185, 200, 215].map((y) => (
          <circle key={y} cx="75" cy={y} r="3.5" fill={gold}/>
        ))}

        {/* Dupatta/stole */}
        <path d="M105,142 C118,150 124,175 120,220 L112,250 C116,210 118,170 105,145 Z" fill={gold} opacity="0.25"/>

        {/* Hand reaching toward bride */}
        <ellipse cx="120" cy="210" rx="9" ry="8" fill={skin}/>
      </g>

      {/* ── ROMANTIC HEARTS + SPARKLES ── */}
      {[0, 0.4, 0.8, 1.2, 1.6, 2.0].map((delay, i) => (
        <motion.text
          key={i}
          x={185 + (i % 3) * 10}
          y={140}
          fontSize={i % 2 === 0 ? '22' : '16'}
          textAnchor="middle"
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: [140, 100, 60], opacity: [0, 1, 0], scale: [0.5, 1.3, 0.6] }}
          transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' }}
        >
          {i % 3 === 0 ? '❤️' : i % 3 === 1 ? '💕' : '✨'}
        </motion.text>
      ))}

      {/* Golden sparkle trail between their eyes */}
      {[155, 170, 185, 200, 215, 230].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy={130}
          r="3"
          fill={gold}
          animate={{ opacity: [0, 1, 0], r: [0, 4, 0] }}
          transition={{ duration: 1.0, delay: i * 0.12, repeat: Infinity }}
        />
      ))}

      {/* ── FIRECRACKERS ── */}
      <Firecracker x={30} y={30} delay={0} />
      <Firecracker x={370} y={25} delay={1.5} />
      <Firecracker x={200} y={10} delay={0.7} />
      <Firecracker x={50} y={280} delay={2.2} />
      <Firecracker x={350} y={275} delay={0.4} />

      {/* ── OM SYMBOL (bigger, glowing) ── */}
      <motion.text
        x="200" y="305"
        fontSize="36"
        textAnchor="middle"
        fill={gold}
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.08, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 12px ${gold})`, transformOrigin: '200px 305px' }}
      >
        ॐ
      </motion.text>

      {/* ── SWASTIKA (sacred geometry — bigger) ── */}
      <motion.g
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        transform="translate(370, 290) scale(0.7)"
      >
        <path d="M-16,0 L16,0 M0,-16 L0,16 M-16,-16 L-16,0 M16,-16 L16,0 M-16,16 L0,16 M0,-16 L16,-16"
          stroke={gold} strokeWidth="4" fill="none" strokeLinecap="square"/>
        <circle cx="-20" cy="-20" r="2.5" fill={gold}/>
        <circle cx="20" cy="-20" r="2.5" fill={gold}/>
        <circle cx="-20" cy="20" r="2.5" fill={gold}/>
        <circle cx="20" cy="20" r="2.5" fill={gold}/>
      </motion.g>

      {/* ── SWASTIKA left side ── */}
      <motion.g
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, delay: 2, repeat: Infinity }}
        transform="translate(30, 290) scale(0.6)"
      >
        <path d="M-16,0 L16,0 M0,-16 L0,16 M-16,-16 L-16,0 M16,-16 L16,0 M-16,16 L0,16 M0,-16 L16,-16"
          stroke={gold} strokeWidth="4" fill="none" strokeLinecap="square"/>
      </motion.g>
    </svg>
  )
}

function HinduBrideSVG({ color }: { color: string }) {
  const gold = '#FFD700'
  const skin = '#F5C6A0'
  const hair = '#1a0a00'
  const red = '#DC143C'

  return (
    <svg viewBox="0 0 200 500" className={styles.brideSvg} style={{ transform: 'scaleX(-1)' }}>
      {/* Long flowing hair */}
      <path d="M60,80 C50,110 45,200 55,320 L75,320 C70,200 65,120 70,85 Z" fill={hair} opacity="0.85"/>
      <path d="M140,80 C150,110 155,200 145,320 L125,320 C130,200 135,120 130,85 Z" fill={hair} opacity="0.85"/>

      {/* Dupatta over head */}
      <path d="M50,50 C65,20 135,20 150,50 C155,65 152,80 145,90 C130,65 110,50 100,48 C90,50 70,65 55,90 C48,80 45,65 50,50 Z" fill={color} opacity="0.9"/>
      <path d="M50,50 C42,80 38,140 44,220 Q50,180 55,140 C52,110 50,80 55,90 Z" fill={color} opacity="0.5"/>

      {/* Head — tall elegant manhwa proportions */}
      <ellipse cx="100" cy="100" rx="42" ry="50" fill={skin}/>

      {/* Big manhwa eyes */}
      <ellipse cx="80" cy="100" rx="14" ry="16" fill="white"/>
      <ellipse cx="120" cy="100" rx="14" ry="16" fill="white"/>
      <ellipse cx="84" cy="100" rx="10" ry="13" fill="#2D1500"/>
      <ellipse cx="124" cy="100" rx="10" ry="13" fill="#2D1500"/>
      <ellipse cx="86" cy="97" rx="7" ry="9" fill="#0a0400"/>
      <ellipse cx="126" cy="97" rx="7" ry="9" fill="#0a0400"/>
      <circle cx="82" cy="92" r="4" fill="white"/>
      <circle cx="122" cy="92" r="4" fill="white"/>
      <circle cx="88" cy="102" r="2.5" fill="white" opacity="0.6"/>
      <circle cx="128" cy="102" r="2.5" fill="white" opacity="0.6"/>
      {/* Eyelashes */}
      <path d="M66,88 Q72,82 80,86" stroke={hair} strokeWidth="2.5" fill="none"/>
      <path d="M120,86 Q128,82 134,88" stroke={hair} strokeWidth="2.5" fill="none"/>

      {/* Bindi */}
      <circle cx="100" cy="72" r="6" fill={red}/>
      <circle cx="100" cy="72" r="3" fill={gold}/>

      {/* Maang tikka */}
      <line x1="100" y1="60" x2="100" y2="42" stroke={gold} strokeWidth="2.5"/>
      <circle cx="100" cy="40" r="5" fill={gold}/>

      {/* Nose */}
      <path d="M97,112 Q100,117 103,112" stroke="#c08060" strokeWidth="1.5" fill="none"/>
      {/* Nose ring */}
      <circle cx="103" cy="115" r="4" fill="none" stroke={gold} strokeWidth="2"/>

      {/* Smile */}
      <path d="M85,125 Q100,136 115,125" stroke="#b05050" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* Blush */}
      <ellipse cx="70" cy="118" rx="10" ry="6" fill="#FFB6C1" opacity="0.4"/>
      <ellipse cx="130" cy="118" rx="10" ry="6" fill="#FFB6C1" opacity="0.4"/>

      {/* Neck */}
      <rect x="86" y="148" width="28" height="16" rx="8" fill={skin}/>

      {/* Necklace */}
      <path d="M72,160 Q100,178 128,160" stroke={gold} strokeWidth="3.5" fill="none"/>
      <circle cx="100" cy="176" r="5" fill={gold}/>
      <circle cx="88" cy="172" r="3" fill={gold}/>
      <circle cx="112" cy="172" r="3" fill={gold}/>

      {/* Lehenga body */}
      <path d="M65,168 C58,195 50,280 42,440 L158,440 C150,280 142,195 135,168 Q120,158 100,158 Q80,158 65,168 Z" fill={color}/>

      {/* Gold border at bottom */}
      <path d="M42,425 Q100,445 158,425" stroke={gold} strokeWidth="4" fill="none" opacity="0.7"/>
      <path d="M45,415 Q100,435 155,415" stroke={gold} strokeWidth="2" fill="none" opacity="0.4"/>

      {/* Pallu drape */}
      <path d="M135,168 C150,175 158,210 155,300 L145,400 C150,280 152,200 135,172 Z" fill={color} opacity="0.6"/>

      {/* Arm + bangles */}
      <path d="M65,180 C50,190 42,210 45,240" stroke={skin} strokeWidth="12" fill="none" strokeLinecap="round"/>
      <ellipse cx="44" cy="230" rx="9" ry="4.5" fill="none" stroke="#FF4500" strokeWidth="3"/>
      <ellipse cx="44" cy="238" rx="9" ry="4.5" fill="none" stroke={gold} strokeWidth="2.5"/>
      <ellipse cx="44" cy="246" rx="9" ry="4.5" fill="none" stroke="#FF4500" strokeWidth="3"/>

      {/* Hand */}
      <ellipse cx="44" cy="256" rx="10" ry="9" fill={skin}/>
    </svg>
  )
}

function HinduGroomSVG({ color }: { color: string }) {
  const gold = '#FFD700'
  const skin = '#F5C6A0'
  const hair = '#1a0a00'

  return (
    <svg viewBox="0 0 200 500" className={styles.groomSvg}>
      {/* Pagdi (turban) — tall and grand */}
      <path d="M40,30 C55,0 145,0 160,30 C168,48 165,65 155,75 C140,50 120,38 100,36 C80,38 60,50 45,75 C35,65 32,48 40,30 Z" fill={color}/>
      {/* Turban folds */}
      <path d="M45,75 C60,58 80,48 100,46 C120,48 140,58 155,75 Q140,82 120,84 Q80,84 60,82 Z" fill={color} opacity="0.5"/>
      <path d="M55,78 Q100,70 145,78" stroke={gold} strokeWidth="3" fill="none" opacity="0.8"/>

      {/* Kalgi feather */}
      <path d="M145,22 C158,10 168,4 164,20 C162,30 155,42 148,48 C144,38 142,28 145,22 Z" fill={gold}/>

      {/* Sehra strings */}
      {[55, 67, 79, 91, 103, 115].map((x) => (
        <g key={x}>
          <line x1={x} y1={84} x2={x} y2={108} stroke={gold} strokeWidth="1.5" opacity="0.5"/>
          <circle cx={x} cy={108} r="3" fill="white" opacity="0.6"/>
        </g>
      ))}

      {/* Head — manhwa tall face */}
      <ellipse cx="100" cy="105" rx="42" ry="48" fill={skin}/>

      {/* Big manhwa eyes */}
      <ellipse cx="80" cy="108" rx="13" ry="15" fill="white"/>
      <ellipse cx="120" cy="108" rx="13" ry="15" fill="white"/>
      <ellipse cx="76" cy="108" rx="10" ry="12" fill="#2D1500"/>
      <ellipse cx="116" cy="108" rx="10" ry="12" fill="#2D1500"/>
      <ellipse cx="74" cy="105" rx="7" ry="9" fill="#0a0400"/>
      <ellipse cx="114" cy="105" rx="7" ry="9" fill="#0a0400"/>
      <circle cx="72" cy="100" r="4" fill="white"/>
      <circle cx="112" cy="100" r="4" fill="white"/>
      <circle cx="78" cy="110" r="2.5" fill="white" opacity="0.6"/>
      <circle cx="118" cy="110" r="2.5" fill="white" opacity="0.6"/>
      {/* Eyebrows */}
      <path d="M66,92 Q78,85 90,92" stroke={hair} strokeWidth="3" fill="none"/>
      <path d="M110,92 Q122,85 134,92" stroke={hair} strokeWidth="3" fill="none"/>

      {/* Nose */}
      <path d="M97,120 Q100,126 103,120" stroke="#c08060" strokeWidth="1.5" fill="none"/>

      {/* Confident smile */}
      <path d="M84,135 Q100,146 116,135" stroke="#b05050" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* Neck */}
      <rect x="86" y="152" width="28" height="16" rx="8" fill={skin}/>

      {/* Sherwani body */}
      <path d="M60,170 C52,200 46,285 40,440 L160,440 C154,285 148,200 140,170 Q125,160 100,160 Q75,160 60,170 Z" fill={color}/>

      {/* Nehru collar */}
      <path d="M82,162 Q100,155 118,162 Q112,174 100,170 Q88,174 82,162 Z" fill={color} opacity="0.7" stroke={gold} strokeWidth="1.5"/>

      {/* Gold buttons */}
      {[185, 205, 225, 245, 265, 285].map((y) => (
        <circle key={y} cx="100" cy={y} r="4" fill={gold}/>
      ))}

      {/* Stole/dupatta */}
      <path d="M140,170 C158,180 165,220 160,320 L150,420 C155,300 158,210 140,175 Z" fill={gold} opacity="0.2"/>

      {/* Arm reaching */}
      <path d="M140,195 C158,205 165,225 162,260" stroke={skin} strokeWidth="12" fill="none" strokeLinecap="round"/>
      {/* Hand */}
      <ellipse cx="162" cy="265" rx="10" ry="9" fill={skin}/>
    </svg>
  )
}

function HinduScene({ color, closeness = 0.5 }: { color: string; closeness?: number }) {
  // closeness 0 = far apart, 1 = together/married
  // bride starts at left: -5% (far) to 25% (close)
  // groom starts at right: -5% (far) to 25% (close)
  const brideLeft = `${-5 + closeness * 30}%`
  const groomRight = `${-5 + closeness * 30}%`

  return (
    <>
      <FloatingSymbol symbol="🪔" x="6%" y="12%" delay={0} size={26}/>
      <FloatingSymbol symbol="🪔" x="88%" y="16%" delay={1.2} size={22}/>
      <FloatingSymbol symbol="🪷" x="3%" y="50%" delay={0.6} size={24}/>
      <FloatingSymbol symbol="🌸" x="92%" y="55%" delay={1.8} size={22}/>
      <FloatingSymbol symbol="✨" x="50%" y="6%" delay={0.3} size={20}/>
      {['6%','16%','26%','40%','56%','70%','82%','94%'].map((x, i) => (
        <FallingPetal key={x} symbol={i % 2 === 0 ? '🌼' : '🌸'} x={x} delay={i * 0.6} size={18}/>
      ))}

      {/* Bride on the LEFT */}
      <div className={styles.brideWrap} style={{ left: brideLeft }}>
        <HinduBrideSVG color={color} />
      </div>

      {/* Groom on the RIGHT */}
      <div className={styles.groomWrap} style={{ right: groomRight }}>
        <HinduGroomSVG color={color} />
      </div>

      {/* Hearts between when close enough */}
      {closeness > 0.5 && (
        <div className={styles.marriedBurst}>
          {[0, 0.3, 0.6, 0.9, 1.2, 1.5].map((delay, i) => (
            <motion.span
              key={i}
              style={{ position: 'absolute', left: `${(i - 3) * 20}px`, fontSize: 20 + closeness * 14 }}
              animate={{ y: [0, -40, -80], opacity: [0, 1, 0], scale: [0.5, 1.2, 0.6] }}
              transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: 0.5 }}
            >
              {i % 3 === 0 ? '❤️' : i % 3 === 1 ? '💕' : '✨'}
            </motion.span>
          ))}
        </div>
      )}

      {/* Firecrackers */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <Firecracker x={50} y={60} delay={0} />
        <Firecracker x={350} y={50} delay={1.5} />
        <Firecracker x={200} y={30} delay={0.7} />
      </svg>
    </>
  )
}

// ─── CHRISTIAN ────────────────────────────────────────────────────────────────

function DoveSVG({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.g
      initial={{ x: x - 80, opacity: 0 }}
      animate={{ x: [x - 80, x + 80], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 5, delay, repeat: Infinity, repeatDelay: 2 }}
    >
      <path d={`M${x},${y} C${x + 10},${y - 8} ${x + 20},${y - 6} ${x + 25},${y} C${x + 20},${y + 4} ${x + 10},${y + 6} ${x},${y} Z`} fill="white" opacity="0.9"/>
      <path d={`M${x + 5},${y - 2} C${x + 5},${y - 14} ${x + 18},${y - 16} ${x + 22},${y - 8}`} fill="white" opacity="0.9"/>
      <path d={`M${x + 10},${y + 2} C${x + 10},${y + 12} ${x + 20},${y + 14} ${x + 24},${y + 7}`} fill="white" opacity="0.85"/>
    </motion.g>
  )
}

function ChristianCoupleSVG({ color }: { color: string }) {
  const dark = 'rgba(0,0,0,0.75)'
  const gold = '#C0A96E'
  const skin = '#D4956A'
  const white = '#ffffff'

  return (
    <svg viewBox="0 0 360 220" className={styles.coupleSvg} fill={dark}>
      {/* Church arch behind couple */}
      <path d="M100,30 L100,180 L260,180 L260,30 Q180,0 100,30 Z" fill="white" opacity="0.06"/>
      <path d="M130,30 Q180,8 230,30" stroke="white" fill="none" strokeWidth="2" opacity="0.15"/>

      {/* Cross */}
      <motion.g
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <rect x="176" y="10" width="8" height="36" rx="2" fill={gold} opacity="0.7"/>
        <rect x="168" y="20" width="24" height="7" rx="2" fill={gold} opacity="0.7"/>
      </motion.g>

      {/* BRIDE */}
      {/* Veil */}
      <path d="M80,38 Q110,18 138,28 Q148,36 148,52 Q136,38 120,34 Q102,32 90,42 Q84,46 80,54 Q76,46 80,38 Z" fill="white" opacity="0.85"/>
      <path d="M80,38 Q74,60 76,90 Q80,82 84,72 Q84,62 80,54 Z" fill="white" opacity="0.5"/>
      {/* Head */}
      <ellipse cx="118" cy="62" rx="20" ry="24" fill={skin}/>
      {/* Eye looking right */}
      <ellipse cx="126" cy="65" rx="5" ry="3" fill={dark}/>
      <circle cx="127.5" cy="64.5" r="1.5" fill="white"/>
      {/* Small tiara suggestion */}
      <path d="M108,40 Q118,34 128,40" stroke={gold} fill="none" strokeWidth="2"/>
      <circle cx="118" cy="38" r="3" fill={gold}/>
      {/* Wedding dress (flowing white) */}
      <path d="M100,86 C96,92 92,110 90,150 L148,150 C148,110 142,92 138,86 Q130,82 118,82 Q106,82 100,86 Z" fill={white} opacity="0.9"/>
      {/* Dress details */}
      <path d="M90,150 Q118,158 148,150" stroke={gold} fill="none" strokeWidth="1.5" opacity="0.5"/>
      {/* Bouquet */}
      <motion.text x="88" y="122" fontSize="24"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '88px 122px' }}>
        💐
      </motion.text>

      {/* GROOM */}
      {/* Head */}
      <ellipse cx="242" cy="64" rx="20" ry="24" fill={skin}/>
      {/* Eye looking left */}
      <ellipse cx="234" cy="67" rx="5" ry="3" fill={dark}/>
      <circle cx="235.5" cy="66.5" r="1.5" fill="white"/>
      {/* Suit body */}
      <path d="M224,88 C220,94 218,114 218,152 L264,152 C264,114 262,94 258,88 Q252,84 242,84 Q232,84 224,88 Z" fill={dark} opacity="0.85"/>
      {/* White shirt + bow tie */}
      <path d="M234,88 Q242,84 250,88 Q246,96 242,94 Q238,96 234,88 Z" fill={white} opacity="0.9"/>
      <path d="M238,90 L244,90 L241,94 Z" fill={color} opacity="0.8"/>
      <path d="M244,90 L240,92 L244,94 Z" fill={color} opacity="0.8"/>
      {/* Boutonniere */}
      <circle cx="256" cy="100" r="5" fill={color} opacity="0.7"/>
      <circle cx="256" cy="100" r="2.5" fill={gold}/>

      {/* ROMANTIC HEARTS */}
      {[0.2, 0.6, 1.0, 1.4].map((delay, i) => (
        <motion.text key={i} x={176 + i * 6} y={70} fontSize="16" textAnchor="middle"
          initial={{ y: 70, opacity: 0 }}
          animate={{ y: [70, 52, 34], opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 1 }}>
          🤍
        </motion.text>
      ))}

      {/* Doves */}
      <DoveSVG x={60} y={25} delay={0}/>
      <DoveSVG x={60} y={40} delay={1.5}/>
    </svg>
  )
}

function ChristianScene({ color }: { color: string }) {
  return (
    <>
      <FloatingSymbol symbol="🕊️" x="5%" y="12%" delay={0} size={26}/>
      <FloatingSymbol symbol="🌸" x="88%" y="18%" delay={1} size={22}/>
      <FloatingSymbol symbol="✝️" x="50%" y="5%" delay={0.5} size={24}/>
      <FloatingSymbol symbol="🌹" x="4%" y="60%" delay={1.5} size={22}/>
      <FloatingSymbol symbol="🌹" x="91%" y="65%" delay={0.8} size={20}/>
      {['10%','25%','40%','60%','75%','90%'].map((x, i) => (
        <FallingPetal key={x} symbol={i % 2 === 0 ? '🌸' : '🌺'} x={x} delay={i * 0.9} size={16}/>
      ))}
      <div className={styles.coupleWrap}>
        <ChristianCoupleSVG color={color}/>
      </div>
    </>
  )
}

// ─── MUSLIM ───────────────────────────────────────────────────────────────────

function MuslimScene({ color }: { color: string }) {
  const gold = '#C0A96E'
  return (
    <>
      <FloatingSymbol symbol="☪️" x="8%" y="10%" delay={0} size={30}/>
      <FloatingSymbol symbol="🌙" x="85%" y="14%" delay={0.8} size={28}/>
      <FloatingSymbol symbol="⭐" x="50%" y="6%" delay={0.4} size={22}/>
      <FloatingSymbol symbol="🌿" x="4%" y="55%" delay={1.2} size={22}/>
      <FloatingSymbol symbol="🌺" x="90%" y="60%" delay={1.6} size={20}/>
      {['12%','28%','45%','62%','78%','92%'].map((x, i) => (
        <FallingPetal key={x} symbol={i % 2 === 0 ? '⭐' : '🌟'} x={x} delay={i * 0.8} size={14}/>
      ))}
      <div className={styles.coupleWrap}>
        <svg viewBox="0 0 360 220" className={styles.coupleSvg}>
          {/* Arabesque geometric background pattern */}
          <motion.g animate={{ opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 4, repeat: Infinity }}>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              return <line key={i} x1={180} y1={110} x2={180 + Math.cos(rad) * 80} y2={110 + Math.sin(rad) * 80} stroke={gold} strokeWidth="1"/>
            })}
            <circle cx="180" cy="110" r="80" stroke={gold} strokeWidth="1" fill="none"/>
            <circle cx="180" cy="110" r="50" stroke={gold} strokeWidth="1" fill="none"/>
            <circle cx="180" cy="110" r="20" stroke={gold} strokeWidth="1" fill="none"/>
          </motion.g>

          {/* Bride — hijab/niqab style */}
          <ellipse cx="110" cy="68" rx="24" ry="28" fill="rgba(0,0,0,0.75)"/>
          {/* Hijab frame */}
          <path d="M86,50 Q110,30 134,50 Q138,62 134,78 Q122,66 110,64 Q98,66 86,78 Q82,62 86,50 Z" fill={color} opacity="0.85"/>
          {/* Face opening */}
          <ellipse cx="110" cy="68" rx="16" ry="20" fill="#D4956A"/>
          {/* Eye */}
          <ellipse cx="118" cy="68" rx="5" ry="3.5" fill="rgba(0,0,0,0.85)"/>
          <circle cx="119.5" cy="67.5" r="1.5" fill="white"/>
          {/* Abaya body */}
          <path d="M88,96 C84,104 82,126 84,160 L136,160 C138,126 136,104 132,96 Q122,90 110,90 Q98,90 88,96 Z" fill={color} opacity="0.8"/>
          <path d="M84,152 Q110,160 136,152" stroke={gold} fill="none" strokeWidth="1.5" opacity="0.5"/>

          {/* Groom — taqiyah + thobe */}
          <ellipse cx="250" cy="70" rx="21" ry="25" fill="#D4956A"/>
          {/* Taqiyah (cap) */}
          <ellipse cx="250" cy="50" rx="21" ry="10" fill="rgba(0,0,0,0.8)"/>
          {/* Eye looking left */}
          <ellipse cx="241" cy="72" rx="5" ry="3.5" fill="rgba(0,0,0,0.85)"/>
          <circle cx="242.5" cy="71.5" r="1.5" fill="white"/>
          {/* Beard suggestion */}
          <path d="M236,88 Q250,96 264,88" fill="rgba(0,0,0,0.4)"/>
          {/* Thobe (white robe) */}
          <path d="M230,98 C226,106 224,128 226,162 L274,162 C276,128 274,106 270,98 Q262,92 250,92 Q238,92 230,98 Z" fill="white" opacity="0.9"/>
          {/* Bisht (cloak over shoulders) */}
          <path d="M226,100 C218,106 214,120 216,140 L226,162 Z" fill={color} opacity="0.6"/>
          <path d="M274,100 C282,106 286,120 284,140 L274,162 Z" fill={color} opacity="0.6"/>
          <path d="M226,100 Q250,96 274,100" stroke={gold} fill="none" strokeWidth="1.5" opacity="0.5"/>

          {/* Crescent + hearts between them */}
          {[0.3, 0.7, 1.1].map((delay, i) => (
            <motion.text key={i} x={168 + i * 10} y={75} fontSize="15" textAnchor="middle"
              initial={{ y: 75, opacity: 0 }} animate={{ y: [75, 55, 35], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, delay, repeat: Infinity, repeatDelay: 1 }}>
              💛
            </motion.text>
          ))}

          {/* Crescent moon top */}
          <motion.text x="180" y="195" fontSize="28" textAnchor="middle" fill={gold}
            animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 8px ${gold})`, transformOrigin: '180px 195px' }}>
            ☪
          </motion.text>
        </svg>
      </div>
    </>
  )
}

// ─── JEWISH ───────────────────────────────────────────────────────────────────

function JewishScene({ color }: { color: string }) {
  const gold = '#C0A96E'
  return (
    <>
      <FloatingSymbol symbol="✡️" x="7%" y="10%" delay={0} size={28}/>
      <FloatingSymbol symbol="🕎" x="86%" y="12%" delay={1} size={26}/>
      <FloatingSymbol symbol="🌹" x="4%" y="58%" delay={0.6} size={22}/>
      <FloatingSymbol symbol="🌹" x="90%" y="62%" delay={1.4} size={22}/>
      {['15%','35%','55%','75%','90%'].map((x, i) => (
        <FallingPetal key={x} symbol="⭐" x={x} delay={i * 1.0} size={14}/>
      ))}
      <div className={styles.coupleWrap}>
        <svg viewBox="0 0 360 220" className={styles.coupleSvg}>
          {/* Chuppah (wedding canopy) */}
          <rect x="70" y="18" width="220" height="6" rx="3" fill={color} opacity="0.7"/>
          <line x1="80" y1="18" x2="80" y2="170" stroke={color} strokeWidth="3" opacity="0.5"/>
          <line x1="280" y1="18" x2="280" y2="170" stroke={color} strokeWidth="3" opacity="0.5"/>
          <motion.path d="M70,18 Q180,8 290,18" stroke={gold} fill="none" strokeWidth="2" opacity="0.6"
            animate={{ d: ['M70,18 Q180,8 290,18', 'M70,18 Q180,12 290,18', 'M70,18 Q180,8 290,18'] }}
            transition={{ duration: 3, repeat: Infinity }}/>

          {/* Star of David rotating */}
          <motion.text x="180" y="18" fontSize="22" textAnchor="middle" fill={gold}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '180px 18px' }}>
            ✡
          </motion.text>

          {/* Bride in white dress */}
          <ellipse cx="118" cy="68" rx="20" ry="24" fill="#D4956A"/>
          <path d="M98,46 Q118,32 138,46 Q144,56 140,66 Q130,52 118,50 Q106,52 96,66 Q92,56 98,46 Z" fill="white" opacity="0.9"/>
          <ellipse cx="126" cy="70" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="127.5" cy="69.5" r="1.5" fill="white"/>
          <path d="M100,92 C96,100 94,122 96,158 L140,158 C142,122 140,100 136,92 Q128,86 118,86 Q108,86 100,92 Z" fill="white" opacity="0.9"/>
          <path d="M96,150 Q118,158 140,150" stroke={gold} fill="none" strokeWidth="1.5" opacity="0.6"/>

          {/* Groom in dark suit + kippah */}
          <ellipse cx="242" cy="70" rx="20" ry="24" fill="#D4956A"/>
          <ellipse cx="242" cy="50" rx="15" ry="8" fill={color} opacity="0.9"/>
          <ellipse cx="234" cy="72" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="235.5" cy="71.5" r="1.5" fill="white"/>
          <path d="M224,94 C220,102 218,124 220,160 L264,160 C266,124 264,102 260,94 Q252,88 242,88 Q232,88 224,94 Z" fill="rgba(0,0,0,0.8)"/>
          <path d="M234,90 Q242,86 250,90 Q246,98 242,96 Q238,98 234,90 Z" fill="white" opacity="0.8"/>
          {[102, 114, 126, 138].map((y) => (
            <circle key={y} cx="242" cy={y} r="2" fill={gold}/>
          ))}

          {/* Hearts */}
          {[0.2, 0.5, 0.8, 1.1].map((delay, i) => (
            <motion.text key={i} x={168 + i * 8} y={74} fontSize="15" textAnchor="middle"
              initial={{ y: 74, opacity: 0 }} animate={{ y: [74, 54, 34], opacity: [0, 1, 0] }}
              transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 1 }}>
              💛
            </motion.text>
          ))}

          <motion.text x="180" y="198" fontSize="24" textAnchor="middle" fill={gold}
            animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 8px ${gold})` }}>
            ✡
          </motion.text>
        </svg>
      </div>
    </>
  )
}

// ─── SIKH ─────────────────────────────────────────────────────────────────────

function SikhScene({ color }: { color: string }) {
  const gold = '#F5A623'
  return (
    <>
      <FloatingSymbol symbol="🪯" x="7%" y="10%" delay={0} size={30}/>
      <FloatingSymbol symbol="🌸" x="87%" y="15%" delay={0.9} size={24}/>
      <FloatingSymbol symbol="🌼" x="4%" y="58%" delay={0.5} size={22}/>
      <FloatingSymbol symbol="✨" x="90%" y="62%" delay={1.5} size={20}/>
      {['10%','25%','42%','60%','76%','90%'].map((x, i) => (
        <FallingPetal key={x} symbol={i % 2 === 0 ? '🌸' : '🌼'} x={x} delay={i * 0.8} size={16}/>
      ))}
      <div className={styles.coupleWrap}>
        <svg viewBox="0 0 360 220" className={styles.coupleSvg}>
          {/* Khanda symbol */}
          <motion.text x="180" y="28" fontSize="30" textAnchor="middle" fill={gold}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 10px ${gold})`, transformOrigin: '180px 28px' }}>
            🪯
          </motion.text>

          {/* Bride in red/pink Punjabi dress */}
          <ellipse cx="112" cy="68" rx="20" ry="24" fill="#D4956A"/>
          {/* Dupatta + phulkari colors */}
          <path d="M88,44 Q112,26 136,44 Q140,56 136,68 Q126,52 112,48 Q98,52 88,68 Q84,56 88,44 Z" fill={color} opacity="0.9"/>
          <ellipse cx="120" cy="70" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="121.5" cy="69.5" r="1.5" fill="white"/>
          <circle cx="116" cy="64" r="3" fill="#DC143C"/>
          <path d="M94,92 C90,100 88,122 90,158 L134,158 C136,122 134,100 130,92 Q122,86 112,86 Q102,86 94,92 Z" fill={color} opacity="0.9"/>
          <path d="M90,150 Q112,158 134,150" stroke={gold} fill="none" strokeWidth="2" opacity="0.6"/>
          <path d="M130,92 Q140,96 144,110 L134,150 Z" fill={color} opacity="0.5"/>
          {/* Bangles */}
          <ellipse cx="88" cy="120" rx="7" ry="3.5" fill="none" stroke="#FF4500" strokeWidth="2.5"/>
          <ellipse cx="88" cy="125" rx="7" ry="3.5" fill="none" stroke={gold} strokeWidth="1.5"/>

          {/* Groom in sherwani + dastar (Sikh turban) */}
          {/* Dastar — tall cylindrical turban */}
          <path d="M214,20 Q238,10 260,20 L264,58 Q244,52 238,52 Q230,52 216,58 Z" fill={color} opacity="0.9"/>
          <path d="M214,20 Q238,14 260,20 Q252,22 238,22 Q224,22 214,20 Z" fill={gold} opacity="0.6"/>
          <ellipse cx="238" cy="78" rx="20" ry="24" fill="#D4956A"/>
          <ellipse cx="230" cy="80" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="231.5" cy="79.5" r="1.5" fill="white"/>
          {/* Beard (many Sikh grooms have beard) */}
          <path d="M222,90 Q238,102 254,90 Q250,110 238,114 Q226,110 222,90 Z" fill="rgba(0,0,0,0.5)"/>
          {/* Sherwani */}
          <path d="M220,110 C216,118 214,138 216,168 L260,168 C262,138 260,118 256,110 Q248,104 238,104 Q228,104 220,110 Z" fill={color} opacity="0.85"/>
          {[116, 128, 140, 152].map((y) => (
            <circle key={y} cx="238" cy={y} r="2.5" fill={gold}/>
          ))}

          {/* Hearts + golden sparkles between them */}
          {[0.2, 0.55, 0.9, 1.25].map((delay, i) => (
            <motion.text key={i} x={156 + i * 10} y={75} fontSize="15" textAnchor="middle"
              initial={{ y: 75, opacity: 0 }} animate={{ y: [75, 55, 35], opacity: [0, 1, 0] }}
              transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 1 }}>
              💛
            </motion.text>
          ))}

          <motion.text x="180" y="200" fontSize="22" textAnchor="middle" fill={gold}
            animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 8px ${gold})` }}>
            ੴ
          </motion.text>
        </svg>
      </div>
    </>
  )
}

// ─── BUDDHIST ─────────────────────────────────────────────────────────────────

function BuddhistScene({ color }: { color: string }) {
  const gold = '#E8A020'
  return (
    <>
      <FloatingSymbol symbol="☸️" x="7%" y="10%" delay={0} size={30}/>
      <FloatingSymbol symbol="🪷" x="87%" y="14%" delay={1} size={26}/>
      <FloatingSymbol symbol="🕯️" x="4%" y="56%" delay={0.6} size={22}/>
      <FloatingSymbol symbol="🌸" x="90%" y="62%" delay={1.4} size={22}/>
      {/* Cherry blossom fall */}
      {['8%','20%','34%','50%','66%','80%','92%'].map((x, i) => (
        <FallingPetal key={x} symbol="🌸" x={x} delay={i * 0.7} size={14}/>
      ))}
      <div className={styles.coupleWrap}>
        <svg viewBox="0 0 360 220" className={styles.coupleSvg}>
          {/* Dharma wheel */}
          <motion.text x="180" y="30" fontSize="32" textAnchor="middle" fill={gold}
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 10px ${gold})`, transformOrigin: '180px 30px' }}>
            ☸
          </motion.text>

          {/* Lotus background */}
          <motion.text x="180" y="175" fontSize="50" textAnchor="middle"
            animate={{ opacity: [0.08, 0.14, 0.08], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ transformOrigin: '180px 175px' }}>
            🪷
          </motion.text>

          {/* Bride in traditional Buddhist attire */}
          <ellipse cx="112" cy="70" rx="20" ry="24" fill="#D4956A"/>
          <path d="M90,48 Q112,32 134,48 Q138,60 134,72 Q124,56 112,52 Q100,56 90,72 Q86,60 90,48 Z" fill={color} opacity="0.85"/>
          <ellipse cx="120" cy="72" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="121.5" cy="71.5" r="1.5" fill="white"/>
          <path d="M96,94 C92,102 90,124 92,160 L132,160 C134,124 132,102 128,94 Q120,88 112,88 Q104,88 96,94 Z" fill={color} opacity="0.85"/>
          <path d="M92,152 Q112,160 132,152" stroke={gold} fill="none" strokeWidth="1.5" opacity="0.5"/>

          {/* Groom */}
          <ellipse cx="248" cy="72" rx="20" ry="24" fill="#D4956A"/>
          <path d="M228,50 Q248,34 268,50 Q272,62 268,74 Q258,58 248,54 Q238,58 228,74 Q224,62 228,50 Z" fill={color} opacity="0.8"/>
          <ellipse cx="240" cy="74" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="241.5" cy="73.5" r="1.5" fill="white"/>
          <path d="M230,96 C226,104 224,126 226,162 L268,162 C270,126 268,104 264,96 Q256,90 248,90 Q240,90 230,96 Z" fill={color} opacity="0.8"/>

          {/* Lotus petals between them */}
          {[0.2, 0.6, 1.0, 1.4].map((delay, i) => (
            <motion.text key={i} x={164 + i * 8} y={76} fontSize="14" textAnchor="middle"
              initial={{ y: 76, opacity: 0 }} animate={{ y: [76, 56, 36], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, delay, repeat: Infinity, repeatDelay: 1 }}>
              🪷
            </motion.text>
          ))}

          <motion.text x="180" y="200" fontSize="22" textAnchor="middle" fill={gold}
            animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 8px ${gold})` }}>
            ☸
          </motion.text>
        </svg>
      </div>
    </>
  )
}

// ─── CIVIL ────────────────────────────────────────────────────────────────────

function CivilScene({ color }: { color: string }) {
  return (
    <>
      <FloatingSymbol symbol="💍" x="7%" y="10%" delay={0} size={26}/>
      <FloatingSymbol symbol="🥂" x="87%" y="14%" delay={0.8} size={24}/>
      <FloatingSymbol symbol="🌹" x="4%" y="56%" delay={0.5} size={22}/>
      <FloatingSymbol symbol="✨" x="90%" y="62%" delay={1.3} size={20}/>
      {['8%','20%','35%','52%','68%','82%','94%'].map((x, i) => (
        <FallingPetal key={x} symbol={['🎊','✨','💫','🎉','⭐','🌟','💥'][i]} x={x} delay={i * 0.6} size={14}/>
      ))}
      <div className={styles.coupleWrap}>
        <svg viewBox="0 0 360 220" className={styles.coupleSvg}>
          {/* Orbiting rings animation */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '180px 30px' }}
          >
            <ellipse cx="180" cy="30" rx="30" ry="12" fill="none" stroke={color} strokeWidth="2.5" opacity="0.5"/>
          </motion.g>
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '180px 30px' }}
          >
            <ellipse cx="180" cy="30" rx="30" ry="14" fill="none" stroke="#C0A96E" strokeWidth="2" opacity="0.4"
              style={{ transform: 'rotateX(60deg)' }}/>
          </motion.g>
          <circle cx="180" cy="30" r="8" fill={color} opacity="0.6"/>
          <circle cx="180" cy="30" r="4" fill="white" opacity="0.5"/>

          {/* Elegant bride */}
          <ellipse cx="112" cy="68" rx="20" ry="24" fill="#D4956A"/>
          <path d="M92,46 Q112,30 132,46 Q136,58 132,70 Q122,54 112,50 Q102,54 92,70 Q88,58 92,46 Z" fill="white" opacity="0.9"/>
          <ellipse cx="120" cy="70" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="121.5" cy="69.5" r="1.5" fill="white"/>
          <path d="M94,92 C90,100 88,122 90,158 L134,158 C136,122 134,100 130,92 Q122,86 112,86 Q102,86 94,92 Z" fill="white" opacity="0.9"/>
          <path d="M90,150 Q112,158 134,150" stroke="#C0A96E" fill="none" strokeWidth="1.5" opacity="0.5"/>
          <motion.text x="90" y="124" fontSize="22"
            animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: '90px 124px' }}>💐</motion.text>

          {/* Groom in suit */}
          <ellipse cx="248" cy="68" rx="20" ry="24" fill="#D4956A"/>
          <ellipse cx="240" cy="70" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="241.5" cy="69.5" r="1.5" fill="white"/>
          <path d="M228,90 C224,98 222,120 224,158 L270,158 C272,120 270,98 266,90 Q258,84 248,84 Q238,84 228,90 Z" fill="rgba(0,0,0,0.8)"/>
          <path d="M238,86 Q248,82 258,86 Q254,94 248,92 Q242,94 238,86 Z" fill="white" opacity="0.9"/>
          <path d="M244,88 L252,88 L248,94 Z" fill={color} opacity="0.8"/>
          {[98, 110, 122].map((y) => (
            <circle key={y} cx="248" cy={y} r="2.5" fill="#C0A96E"/>
          ))}

          {/* Hearts */}
          {[0.2, 0.5, 0.8, 1.1].map((delay, i) => (
            <motion.text key={i} x={168 + i * 8} y={72} fontSize="15" textAnchor="middle"
              initial={{ y: 72, opacity: 0 }} animate={{ y: [72, 52, 32], opacity: [0, 1, 0] }}
              transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 1 }}>
              ❤️
            </motion.text>
          ))}

          <motion.text x="180" y="200" fontSize="24" textAnchor="middle" fill="#C0A96E"
            animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 8px #C0A96E)' }}>
            ∞
          </motion.text>
        </svg>
      </div>
    </>
  )
}

// ─── OTHER / DEFAULT ──────────────────────────────────────────────────────────

function OtherScene({ color }: { color: string }) {
  return (
    <>
      <FloatingSymbol symbol="💍" x="7%" y="10%" delay={0} size={26}/>
      <FloatingSymbol symbol="🌹" x="87%" y="14%" delay={0.8} size={24}/>
      <FloatingSymbol symbol="✨" x="4%" y="56%" delay={0.5} size={22}/>
      <FloatingSymbol symbol="🎊" x="90%" y="62%" delay={1.3} size={20}/>
      {['10%','24%','40%','56%','72%','88%'].map((x, i) => (
        <FallingPetal key={x} symbol={['🌸','🌺','🌹','🌸','💮','🌸'][i]} x={x} delay={i * 0.8} size={16}/>
      ))}
      <div className={styles.coupleWrap}>
        <svg viewBox="0 0 360 220" className={styles.coupleSvg}>
          <motion.text x="180" y="26" fontSize="22" textAnchor="middle" fill="rgba(255,255,255,0.5)"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ transformOrigin: '180px 26px' }}>
            💍
          </motion.text>

          {/* Generic elegant couple */}
          <ellipse cx="112" cy="68" rx="20" ry="24" fill="#D4956A"/>
          <path d="M92,46 Q112,30 132,46 Q136,58 132,70 Q122,54 112,50 Q102,54 92,70 Q88,58 92,46 Z" fill={color} opacity="0.85"/>
          <ellipse cx="120" cy="70" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="121.5" cy="69.5" r="1.5" fill="white"/>
          <path d="M94,92 C90,100 88,122 90,158 L134,158 C136,122 134,100 130,92 Q122,86 112,86 Q102,86 94,92 Z" fill={color} opacity="0.85"/>
          <path d="M90,150 Q112,158 134,150" stroke="#C0A96E" fill="none" strokeWidth="1.5" opacity="0.4"/>

          <ellipse cx="248" cy="68" rx="20" ry="24" fill="#D4956A"/>
          <ellipse cx="240" cy="70" rx="5" ry="3" fill="rgba(0,0,0,0.8)"/>
          <circle cx="241.5" cy="69.5" r="1.5" fill="white"/>
          <path d="M228,90 C224,98 222,120 224,158 L270,158 C272,120 270,98 266,90 Q258,84 248,84 Q238,84 228,90 Z" fill={color} opacity="0.8"/>

          {[0.2, 0.6, 1.0, 1.4].map((delay, i) => (
            <motion.text key={i} x={164 + i * 8} y={72} fontSize="16" textAnchor="middle"
              initial={{ y: 72, opacity: 0 }} animate={{ y: [72, 52, 32], opacity: [0, 1, 0] }}
              transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 1 }}>
              ❤️
            </motion.text>
          ))}
        </svg>
      </div>
    </>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function ReligiousAnimations({ theme, color, closeness = 0.5 }: Props) {
  return (
    <div className={styles.container}>
      {theme === 'hindu'     && <HinduScene color={color} closeness={closeness} />}
      {theme === 'christian' && <ChristianScene color={color} />}
      {theme === 'muslim'    && <MuslimScene color={color} />}
      {theme === 'jewish'    && <JewishScene color={color} />}
      {theme === 'sikh'      && <SikhScene color={color} />}
      {theme === 'buddhist'  && <BuddhistScene color={color} />}
      {theme === 'civil'     && <CivilScene color={color} />}
      {theme === 'other'     && <OtherScene color={color} />}
    </div>
  )
}
