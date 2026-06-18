import type { ReligiousTheme } from '../types'

export interface ThemeConfig {
  label: string
  emoji: string
  primaryColor: string
  accentColor: string
  bgGradient: string
  detailBg: string
  fontStyle: 'serif' | 'cursive'
  decorations: string[]
}

export const RELIGIOUS_THEMES: Record<ReligiousTheme, ThemeConfig> = {
  christian: {
    label: 'Christian',
    emoji: '✝️',
    primaryColor: '#5B2C6F',
    accentColor: '#C0A96E',
    bgGradient: 'linear-gradient(135deg, #f9f3ff 0%, #f3e8ff 100%)',
    detailBg: '#6B4C8F',
    fontStyle: 'serif',
    decorations: ['✝', '🕊️', '🌸', '💒'],
  },
  hindu: {
    label: 'Hindu',
    emoji: '🪔',
    primaryColor: '#B5451B',
    accentColor: '#F5A623',
    bgGradient: 'linear-gradient(135deg, #fff8f0 0%, #fff0d8 100%)',
    detailBg: '#C0541F',
    fontStyle: 'serif',
    decorations: ['🪔', '🌸', '🪷', '🌼'],
  },
  muslim: {
    label: 'Muslim',
    emoji: '☪️',
    primaryColor: '#1A5276',
    accentColor: '#C0A96E',
    bgGradient: 'linear-gradient(135deg, #f0f8ff 0%, #e8f4fd 100%)',
    detailBg: '#1F6187',
    fontStyle: 'serif',
    decorations: ['☪️', '🌙', '⭐', '🌿'],
  },
  jewish: {
    label: 'Jewish',
    emoji: '✡️',
    primaryColor: '#1A3A6B',
    accentColor: '#C0A96E',
    bgGradient: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
    detailBg: '#1E4080',
    fontStyle: 'serif',
    decorations: ['✡️', '🕎', '🌹', '🎊'],
  },
  sikh: {
    label: 'Sikh',
    emoji: '🪯',
    primaryColor: '#7B5E00',
    accentColor: '#F5A623',
    bgGradient: 'linear-gradient(135deg, #fffbf0 0%, #fff5d6 100%)',
    detailBg: '#8C6A00',
    fontStyle: 'serif',
    decorations: ['🪯', '🌸', '🌼', '✨'],
  },
  buddhist: {
    label: 'Buddhist',
    emoji: '☸️',
    primaryColor: '#5C4A1E',
    accentColor: '#E8A020',
    bgGradient: 'linear-gradient(135deg, #fffaf0 0%, #fff3d6 100%)',
    detailBg: '#6B5522',
    fontStyle: 'serif',
    decorations: ['☸️', '🪷', '🌸', '🕯️'],
  },
  civil: {
    label: 'Civil',
    emoji: '🏛️',
    primaryColor: '#2C3E50',
    accentColor: '#95A5A6',
    bgGradient: 'linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%)',
    detailBg: '#34495E',
    fontStyle: 'serif',
    decorations: ['💍', '🌹', '🥂', '✨'],
  },
  other: {
    label: 'Other',
    emoji: '💍',
    primaryColor: '#8B1A1A',
    accentColor: '#C4A882',
    bgGradient: 'linear-gradient(135deg, #fff8f8 0%, #fff0f0 100%)',
    detailBg: '#7B8C5A',
    fontStyle: 'cursive',
    decorations: ['💍', '🌸', '✨', '🎊'],
  },
}

export const DEFAULT_ALBUMS = [
  { name: 'Wedding Ceremony', emoji: '💒', description: 'The ceremony moments', isPrivate: false },
  { name: 'Reception', emoji: '🥂', description: 'Dinner, dancing & celebrations', isPrivate: false },
  { name: 'After Party', emoji: '🎉', description: 'The party continues!', isPrivate: false },
  { name: "Bachelor's Night", emoji: '🕺', description: 'Private pre-wedding celebration', isPrivate: true },
  { name: "Bachelorette Night", emoji: '💃', description: 'Private pre-wedding celebration', isPrivate: true },
  { name: 'Getting Ready', emoji: '💄', description: 'Behind the scenes prep', isPrivate: false },
  { name: 'Candid Moments', emoji: '📸', description: 'Unscripted real moments', isPrivate: false },
]
