// Firestore security rules tests — run with `npm test` (starts the local emulator).
import { readFileSync } from 'node:fs'
import { after, before, beforeEach, describe, test } from 'node:test'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import {
  Timestamp, collection, deleteDoc, doc, getDoc, getDocs, increment, query,
  serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore'

const DAY = 24 * 60 * 60 * 1000
let env

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-wedding-wall',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})
after(() => env.cleanup())
beforeEach(() => env.clearFirestore())

const couple = () => env.authenticatedContext('couple').firestore()
const guest = (uid = 'guest') => env.authenticatedContext(uid).firestore()

async function seedWedding(data = {}) {
  await env.withSecurityRulesDisabled((ctx) =>
    setDoc(doc(ctx.firestore(), 'weddings/w1'), { createdBy: 'couple', date: '2026-12-01', photoCount: 0, ...data }))
}

function photoData(uid, { expireInDays = 29, pro = false } = {}) {
  return {
    url: 'data:image/jpeg;base64,AAAA', uploaderId: uid, albumId: '', timestamp: serverTimestamp(),
    ...(pro ? {} : { expireAt: Timestamp.fromMillis(Date.now() + expireInDays * DAY) }),
  }
}

function upload(db, uid, opts) {
  const ref = doc(collection(db, 'weddings/w1/photos'))
  const batch = writeBatch(db)
  batch.set(ref, photoData(uid, opts))
  batch.update(doc(db, 'weddings/w1'), { photoCount: increment(1), lastPhotoId: ref.id })
  return { ref, commit: () => batch.commit() }
}

describe('wedding tenancy', () => {
  test('anyone signed in can open a wedding by id (QR link)', async () => {
    await seedWedding()
    await assertSucceeds(getDoc(doc(guest(), 'weddings/w1')))
  })
  test('nobody can list all weddings', async () => {
    await seedWedding()
    await assertFails(getDocs(collection(guest(), 'weddings')))
  })
  test('the couple can list only their own weddings', async () => {
    await seedWedding()
    await assertSucceeds(getDocs(query(collection(couple(), 'weddings'), where('createdBy', '==', 'couple'))))
    await assertFails(getDocs(query(collection(guest(), 'weddings'), where('createdBy', '==', 'couple'))))
  })
  test('unauthenticated users cannot read', async () => {
    await seedWedding()
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'weddings/w1')))
  })
})

describe('plan is server-owned', () => {
  test('cannot create a wedding that is already pro', async () => {
    await assertFails(setDoc(doc(couple(), 'weddings/w2'), { createdBy: 'couple', photoCount: 0, plan: 'pro' }))
  })
  test('cannot create a wedding with a pre-filled counter', async () => {
    await assertFails(setDoc(doc(couple(), 'weddings/w2'), { createdBy: 'couple', photoCount: -100 }))
  })
  test('normal wedding creation works', async () => {
    await assertSucceeds(setDoc(doc(couple(), 'weddings/w2'), { createdBy: 'couple', photoCount: 0, bride: 'A' }))
  })
  test('even the couple cannot upgrade themselves to pro', async () => {
    await seedWedding()
    await assertFails(updateDoc(doc(couple(), 'weddings/w1'), { plan: 'pro' }))
  })
  test('counter cannot be changed without a matching photo', async () => {
    await seedWedding({ photoCount: 10 })
    await assertFails(updateDoc(doc(guest(), 'weddings/w1'), { photoCount: 0, lastPhotoId: 'x' }))
    await assertFails(updateDoc(doc(guest(), 'weddings/w1'), { photoCount: increment(-1), lastPhotoId: 'nope' }))
  })
})

describe('server-side photo cap', () => {
  test('free upload with counter bump succeeds', async () => {
    await seedWedding()
    await assertSucceeds(upload(guest(), 'guest').commit())
    let count
    await env.withSecurityRulesDisabled(async (ctx) => {
      count = (await getDoc(doc(ctx.firestore(), 'weddings/w1'))).data().photoCount
    })
    if (count !== 1) throw new Error(`counter not incremented: ${count}`)
  })
  test('photo without counter bump is rejected (old mobile clients)', async () => {
    await seedWedding()
    await assertFails(setDoc(doc(guest(), 'weddings/w1/photos/p1'), photoData('guest')))
  })
  test('upload number 51 on a free event is rejected', async () => {
    await seedWedding({ photoCount: 50 })
    await assertFails(upload(guest(), 'guest').commit())
  })
  test('upload number 50 on a free event is allowed', async () => {
    await seedWedding({ photoCount: 49 })
    await assertSucceeds(upload(guest(), 'guest').commit())
  })
  test('pro events are not capped and must not expire', async () => {
    await seedWedding({ photoCount: 500, plan: 'pro' })
    await assertSucceeds(upload(guest(), 'guest', { pro: true }).commit())
    await assertFails(upload(guest(), 'guest').commit())
  })
  test('cannot upload as someone else', async () => {
    await seedWedding()
    await assertFails(upload(guest(), 'someone-else').commit())
  })
})

describe('retention (TTL expireAt)', () => {
  test('free photos without expireAt are rejected', async () => {
    await seedWedding()
    const db = guest()
    const ref = doc(collection(db, 'weddings/w1/photos'))
    const { expireAt: _drop, ...noExpiry } = photoData('guest')
    const batch = writeBatch(db)
    batch.set(ref, noExpiry)
    batch.update(doc(db, 'weddings/w1'), { photoCount: increment(1), lastPhotoId: ref.id })
    await assertFails(batch.commit())
  })
  test('free photos cannot be set to live forever', async () => {
    await seedWedding()
    await assertFails(upload(guest(), 'guest', { expireInDays: 3650 }).commit())
  })
})

describe('deleting photos', () => {
  async function seedPhoto(count = 1) {
    await seedWedding({ photoCount: count })
    await env.withSecurityRulesDisabled((ctx) =>
      setDoc(doc(ctx.firestore(), 'weddings/w1/photos/p1'), { url: 'x', uploaderId: 'guest', albumId: '' }))
  }
  function del(db) {
    const batch = writeBatch(db)
    batch.delete(doc(db, 'weddings/w1/photos/p1'))
    batch.update(doc(db, 'weddings/w1'), { photoCount: increment(-1), lastPhotoId: 'p1' })
    return batch.commit()
  }
  test('uploader can delete and free a slot', async () => {
    await seedPhoto()
    await assertSucceeds(del(guest()))
  })
  test('couple can delete any photo', async () => {
    await seedPhoto()
    await assertSucceeds(del(couple()))
  })
  test('other guests cannot delete', async () => {
    await seedPhoto()
    await assertFails(del(guest('other')))
  })
  test('delete without decrement is rejected while the counter is in use', async () => {
    await seedPhoto(5)
    await assertFails(deleteDoc(doc(guest(), 'weddings/w1/photos/p1')))
  })
  test('legacy events (counter 0) can still delete', async () => {
    await seedPhoto(0)
    await assertSucceeds(deleteDoc(doc(guest(), 'weddings/w1/photos/p1')))
  })
})

describe('reactions', () => {
  test('guest can react with their own uid only', async () => {
    await seedWedding()
    await assertSucceeds(setDoc(doc(guest(), 'weddings/w1/photos/p1/reactions/guest'), { emoji: '❤️' }))
    await assertFails(setDoc(doc(guest(), 'weddings/w1/photos/p1/reactions/other'), { emoji: '❤️' }))
  })
})
