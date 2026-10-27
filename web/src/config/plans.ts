import type { Wedding } from '../types'

export type PlanId = 'free' | 'pro'

export interface Plan {
  id: PlanId
  name: string
  price: number            // USD, one-time per event
  photoLimit: number | null // null = unlimited (per event, across all albums)
  watermark: boolean
  retentionDays: number | null // null = forever
  features: string[]
}

// Single source of truth for tier limits — UI, paywall and enforcement all read from here.
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    photoLimit: 50,
    watermark: true,
    retentionDays: 30,
    features: ['Up to 50 photos', 'Watermarked album download', 'Photos kept for 30 days'],
  },
  pro: {
    id: 'pro',
    name: 'Event Pass',
    price: 49,
    photoLimit: null,
    watermark: false,
    retentionDays: null,
    features: ['Unlimited photos', 'Full-quality download, no watermark', 'Photos kept forever'],
  },
}

export function planOf(wedding: Pick<Wedding, 'plan'>): Plan {
  return PLANS[wedding.plan ?? 'free']
}

export function isPhotoLimitReached(wedding: Pick<Wedding, 'plan'>, photoCount: number): boolean {
  const { photoLimit } = planOf(wedding)
  return photoLimit !== null && photoCount >= photoLimit
}

/** Remaining upload slots for the event, or Infinity when unlimited. */
export function photosRemaining(wedding: Pick<Wedding, 'plan'>, photoCount: number): number {
  const { photoLimit } = planOf(wedding)
  return photoLimit === null ? Infinity : Math.max(0, photoLimit - photoCount)
}
