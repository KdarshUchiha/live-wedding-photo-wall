// Events a guest has opened via QR / link. Weddings can't be listed by non-owners anymore,
// so this is how a returning guest finds their events on the home page.
const KEY = 'ww:joinedWeddings'

export function getJoinedWeddingIds(): string[] {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function rememberJoinedWedding(id: string): void {
  const ids = getJoinedWeddingIds()
  if (!ids.includes(id)) localStorage.setItem(KEY, JSON.stringify([...ids, id]))
}

export function forgetJoinedWedding(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getJoinedWeddingIds().filter((x) => x !== id)))
}
