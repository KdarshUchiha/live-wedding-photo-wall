import { useState } from 'react'
import { motion } from 'framer-motion'
import type { User } from 'firebase/auth'
import { submitRsvp } from '../services/rsvpService'
import type { Wedding } from '../types'
import styles from './InvitePage.module.css'

interface Props { wedding: Wedding; user: User; onBack: () => void }

function LaceBorder() {
  return (
    <svg className={styles.lace} viewBox="0 0 400 30" fill="none">
      {Array.from({ length: 20 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 20}, 0)`}>
          <circle cx="10" cy="10" r="8" stroke="#c9a96e" strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="10" cy="10" r="3" fill="#c9a96e" opacity="0.4" />
        </g>
      ))}
    </svg>
  )
}

function formatFullDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`
}

const MEAL_OPTIONS = [
  'No preference',
  'Vegetarian',
  'Vegan',
  'Non-vegetarian',
  'Halal',
  'Kosher',
  'Gluten-free',
]

export default function InvitePage({ wedding, user, onBack }: Props) {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState<'yes' | 'no' | 'maybe'>('yes')
  const [guestCount, setGuestCount] = useState(1)
  const [mealPreference, setMealPreference] = useState('No preference')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await submitRsvp(wedding.id, user.uid, {
        name: name.trim(),
        attending,
        guestCount,
        mealPreference,
        message: message.trim(),
      })
      setSubmitted(true)
    } catch {
      // silently fail for now
    } finally {
      setSubmitting(false)
    }
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('https://kdarshuchiha.github.io/live-wedding-photo-wall/')}`

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 240 }}
      >
        <LaceBorder />

        <div className={styles.inner}>
          <p className={styles.together}>Together with their families</p>
          <p className={styles.requestHonour}>request the honour of your presence</p>
          <p className={styles.atMarriage}>at the marriage of</p>

          <div className={styles.names}>
            <span className={styles.name}>{wedding.bride}</span>
            <span className={styles.ampersand}>&amp;</span>
            <span className={styles.name}>{wedding.groom}</span>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerFlower}>✿</span>
            <span className={styles.dividerLine} />
          </div>

          {wedding.date && (
            <p className={styles.date}>{formatFullDate(wedding.date)}</p>
          )}
          {wedding.time && (
            <p className={styles.time}>at {formatTime(wedding.time)}</p>
          )}

          {wedding.venue && (
            <>
              <p className={styles.venueLabel}>Ceremony &amp; Reception</p>
              <p className={styles.venueName}>{wedding.venue}</p>
            </>
          )}
          {wedding.location && (
            <p className={styles.venueLocation}>{wedding.location}</p>
          )}

          <div className={styles.divider} style={{ margin: '28px 0 24px' }}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerFlower}>✿</span>
            <span className={styles.dividerLine} />
          </div>

          <p className={styles.rsvpLabel}>Kindly reply by</p>
          <p className={styles.rsvpDate}>
            {wedding.date ? new Date(new Date(wedding.date).getTime() - 14 * 86400000)
              .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
          </p>
        </div>

        <LaceBorder />
      </motion.div>

      {/* RSVP Form */}
      <motion.div
        className={styles.rsvpSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', damping: 20 }}
      >
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerFlower}>✿</span>
          <span className={styles.dividerLine} />
        </div>

        <h3 className={styles.rsvpTitle}>RSVP</h3>

        {submitted ? (
          <div className={styles.thankYou}>
            <span className={styles.thankYouIcon}>💌</span>
            <h4 className={styles.thankYouHeading}>Thank you!</h4>
            <p className={styles.thankYouText}>Your response has been recorded. We look forward to celebrating with you!</p>
          </div>
        ) : (
          <form className={styles.rsvpForm} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Your Name</label>
              <input
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Will you be attending?</label>
              <div className={styles.radioGroup}>
                {(['yes', 'no', 'maybe'] as const).map((opt) => (
                  <label key={opt} className={`${styles.radioLabel} ${attending === opt ? styles.radioActive : ''}`}>
                    <input
                      type="radio"
                      name="attending"
                      value={opt}
                      checked={attending === opt}
                      onChange={() => setAttending(opt)}
                      className={styles.radioInput}
                    />
                    {opt === 'yes' ? 'Yes' : opt === 'no' ? 'No' : 'Maybe'}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Number of Guests</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={10}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.min(10, Math.max(1, Number(e.target.value))))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Meal Preference</label>
              <select
                className={styles.select}
                value={mealPreference}
                onChange={(e) => setMealPreference(e.target.value)}
              >
                {MEAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Message (optional)</label>
              <textarea
                className={styles.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send your wishes to the couple..."
                rows={3}
              />
            </div>

            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !name.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {submitting ? 'Submitting...' : 'Submit RSVP'}
            </motion.button>
          </form>
        )}
      </motion.div>

      {/* Gift Registry */}
      <div className={styles.registry}>
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerFlower}>🎁</span>
          <span className={styles.dividerLine} />
        </div>
        <h3 className={styles.registryTitle}>Gift Registry</h3>
        <p className={styles.registryDesc}>Your presence is our greatest gift, but if you wish to bless us further:</p>
        <div className={styles.registryLinks}>
          <a className={styles.registryLink} href="#" target="_blank">🛍️ Amazon</a>
          <a className={styles.registryLink} href="#" target="_blank">💝 Zola</a>
          <a className={styles.registryLink} href="#" target="_blank">🏠 Crate & Barrel</a>
        </div>
      </div>

      {/* QR Code */}
      <motion.div
        className={styles.qrSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerFlower}>📱</span>
          <span className={styles.dividerLine} />
        </div>
        <img
          className={styles.qrCode}
          src={qrUrl}
          alt="QR code to open on phone"
          width={160}
          height={160}
        />
        <p className={styles.qrText}>Scan to open on your phone</p>
      </motion.div>
    </div>
  )
}
