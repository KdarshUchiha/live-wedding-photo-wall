import { useEffect, useState } from 'react'
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) signInAnonymously(auth)
    })
    return unsub
  }, [])

  return user
}
