import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDsLExXN7Wd2zdWa7A32rWTfHz8zQ_IVq0',
  authDomain: 'wedding-invitation-app-26a72.firebaseapp.com',
  projectId: 'wedding-invitation-app-26a72',
  messagingSenderId: '127161126992',
  appId: '1:127161126992:web:a7b7656933bd8296e98155',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
