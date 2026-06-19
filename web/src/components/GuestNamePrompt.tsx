import { useState } from 'react'
import styles from './GuestNamePrompt.module.css'

interface Props {
  onSave: (name: string) => void
}

export default function GuestNamePrompt({ onSave }: Props) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed) onSave(trimmed)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Welcome</h2>
        <p className={styles.subtitle}>What's your name?</p>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter your name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          maxLength={60}
          autoFocus
        />
        <button
          className={styles.continueBtn}
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
