import { Kit } from './types'

export const KITS: Kit[] = [
  {
    id: 'lime',
    name: 'Lime Strike',
    primary: '#C8FF00',
    secondary: '#030303',
    trim: '#63FF47',
    pattern: 'solid',
    unlocked: true,
  },
  {
    id: 'volt',
    name: 'Volt Surge',
    primary: '#63FF47',
    secondary: '#062b12',
    trim: '#C8FF00',
    pattern: 'sash',
    unlocked: true,
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#00D9C7',
    secondary: '#03201f',
    trim: '#FFFFFF',
    pattern: 'hoops',
    unlocked: true,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: '#0D0D0D',
    secondary: '#C8FF00',
    trim: '#C8FF00',
    pattern: 'solid',
    unlocked: true,
  },
  {
    id: 'gold',
    name: 'Trophy Gold',
    primary: '#FFD54A',
    secondary: '#1a1400',
    trim: '#030303',
    pattern: 'sash',
    unlocked: true,
  },
  {
    id: 'ghost',
    name: 'Ghost White',
    primary: '#FFFFFF',
    secondary: '#BFC4C9',
    trim: '#00D9C7',
    pattern: 'hoops',
    unlocked: true,
  },
  {
    id: 'crimson',
    name: 'Crimson Edge',
    primary: '#FF4D4D',
    secondary: '#1a0606',
    trim: '#FFD54A',
    pattern: 'solid',
    unlocked: false,
    req: 'Reach a 5 streak',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    primary: '#9B5CFF',
    secondary: '#0d0620',
    trim: '#00D9C7',
    pattern: 'sash',
    unlocked: false,
    req: 'Reach level 8',
  },
]

export const DEFAULT_KIT_ID = 'lime'

export function getKit(id: string): Kit {
  return KITS.find((k) => k.id === id) ?? KITS[0]
}
