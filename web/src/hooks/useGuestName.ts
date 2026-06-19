import { useState } from 'react'

export function useGuestName() {
  const [name, setName] = useState(() => localStorage.getItem('wedding_wall_guest_name') || '')

  const saveName = (newName: string) => {
    localStorage.setItem('wedding_wall_guest_name', newName)
    setName(newName)
  }

  return { name, saveName, hasName: name.length > 0 }
}
