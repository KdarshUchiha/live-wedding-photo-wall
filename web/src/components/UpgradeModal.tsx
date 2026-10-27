import { motion } from 'framer-motion'
import { PLANS } from '../config/plans'
import styles from './UpgradeModal.module.css'

interface Props {
  photoCount: number
  onUpgrade: () => void
  onClose: () => void
}

export default function UpgradeModal({ photoCount, onUpgrade, onClose }: Props) {
  const free = PLANS.free
  const pro = PLANS.pro

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div className={styles.modal} onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 240 }}>
        <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        <h2 className={styles.title}>Keep every memory</h2>
        <p className={styles.subtitle}>
          {photoCount}/{free.photoLimit} free photos used. Upgrade this event to keep the wall open for every guest.
        </p>

        <div className={styles.plans}>
          <div className={styles.plan}>
            <h3>{free.name}</h3>
            <p className={styles.price}>$0</p>
            <ul>{free.features.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
          <div className={`${styles.plan} ${styles.pro}`}>
            <span className={styles.badge}>Best for the big day</span>
            <h3>{pro.name}</h3>
            <p className={styles.price}>${pro.price}<span> / event</span></p>
            <ul>{pro.features.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
        </div>

        <button className={styles.cta} onClick={onUpgrade}>
          Upgrade to {pro.name} · ${pro.price}
        </button>
      </motion.div>
    </div>
  )
}
