import { Kit } from './types'

export const KITS: Kit[] = [
  // CONCACAF
  { id: 'usa',          name: 'USA',          primary: '#002868', secondary: '#BF0A30', trim: '#FFFFFF', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'canada',       name: 'Canada',       primary: '#FF0000', secondary: '#FFFFFF', trim: '#000000', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'mexico',       name: 'Mexico',       primary: '#006847', secondary: '#FFFFFF', trim: '#CE1126', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'panama',       name: 'Panama',       primary: '#D21034', secondary: '#FFFFFF', trim: '#003087', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'costa-rica',   name: 'Costa Rica',   primary: '#002B7F', secondary: '#FFFFFF', trim: '#CE1126', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'jamaica',      name: 'Jamaica',      primary: '#000000', secondary: '#FFD100', trim: '#009B3A', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'honduras',     name: 'Honduras',     primary: '#0073CF', secondary: '#FFFFFF', trim: '#0073CF', pattern: 'solid', unlocked: true, type: 'country' },
  // CONMEBOL
  { id: 'argentina',    name: 'Argentina',    primary: '#74ACDF', secondary: '#FFFFFF', trim: '#F6B40E', pattern: 'hoops', unlocked: true, type: 'country' },
  { id: 'brazil',       name: 'Brazil',       primary: '#009C3B', secondary: '#FFDF00', trim: '#002776', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'colombia',     name: 'Colombia',     primary: '#FCD116', secondary: '#003893', trim: '#CE1126', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'uruguay',      name: 'Uruguay',      primary: '#75AADB', secondary: '#FFFFFF', trim: '#000000', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'ecuador',      name: 'Ecuador',      primary: '#FFD100', secondary: '#003580', trim: '#CE1126', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'chile',        name: 'Chile',        primary: '#D52B1E', secondary: '#FFFFFF', trim: '#003082', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'paraguay',     name: 'Paraguay',     primary: '#D52B1E', secondary: '#FFFFFF', trim: '#0038A8', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'venezuela',    name: 'Venezuela',    primary: '#CF142B', secondary: '#003082', trim: '#F4C400', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'peru',         name: 'Peru',         primary: '#D91023', secondary: '#FFFFFF', trim: '#D91023', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'bolivia',      name: 'Bolivia',      primary: '#007A3D', secondary: '#D52B1E', trim: '#F4C400', pattern: 'solid', unlocked: true, type: 'country' },
  // UEFA
  { id: 'germany',      name: 'Germany',      primary: '#FFFFFF', secondary: '#000000', trim: '#DD0000', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'france',       name: 'France',       primary: '#002395', secondary: '#FFFFFF', trim: '#ED2939', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'spain',        name: 'Spain',        primary: '#AA151B', secondary: '#F1BF00', trim: '#AA151B', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'england',      name: 'England',      primary: '#FFFFFF', secondary: '#003090', trim: '#CE1126', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'portugal',     name: 'Portugal',     primary: '#006600', secondary: '#FF0000', trim: '#FFCC00', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'netherlands',  name: 'Netherlands',  primary: '#FF6600', secondary: '#FFFFFF', trim: '#003DA5', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'belgium',      name: 'Belgium',      primary: '#000000', secondary: '#FF0000', trim: '#FFE600', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'italy',        name: 'Italy',        primary: '#003399', secondary: '#FFFFFF', trim: '#009246', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'croatia',      name: 'Croatia',      primary: '#FF0000', secondary: '#FFFFFF', trim: '#003DA5', pattern: 'hoops', unlocked: true, type: 'country' },
  { id: 'switzerland',  name: 'Switzerland',  primary: '#FF0000', secondary: '#FFFFFF', trim: '#DA291C', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'denmark',      name: 'Denmark',      primary: '#C60C30', secondary: '#FFFFFF', trim: '#C60C30', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'austria',      name: 'Austria',      primary: '#ED2939', secondary: '#FFFFFF', trim: '#ED2939', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'serbia',       name: 'Serbia',       primary: '#C6363C', secondary: '#0C4076', trim: '#FFFFFF', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'poland',       name: 'Poland',       primary: '#FFFFFF', secondary: '#DC143C', trim: '#DC143C', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'scotland',     name: 'Scotland',     primary: '#003073', secondary: '#FFFFFF', trim: '#FF9900', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'romania',      name: 'Romania',      primary: '#002B7F', secondary: '#FCD116', trim: '#CE1126', pattern: 'solid', unlocked: true, type: 'country' },
  // CAF
  { id: 'morocco',      name: 'Morocco',      primary: '#C1272D', secondary: '#006233', trim: '#FFFFFF', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'nigeria',      name: 'Nigeria',      primary: '#008751', secondary: '#FFFFFF', trim: '#008751', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'egypt',        name: 'Egypt',        primary: '#CC0000', secondary: '#FFFFFF', trim: '#000000', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'senegal',      name: 'Senegal',      primary: '#00853F', secondary: '#FDEF42', trim: '#E31B23', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'cameroon',     name: 'Cameroon',     primary: '#007A5E', secondary: '#CE1126', trim: '#FCD116', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'south-africa', name: 'South Africa', primary: '#007A4D', secondary: '#FFB81C', trim: '#001489', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'algeria',      name: 'Algeria',      primary: '#FFFFFF', secondary: '#006233', trim: '#D21034', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'ivory-coast',  name: 'Ivory Coast',  primary: '#F77F00', secondary: '#009A44', trim: '#FFFFFF', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'ghana',        name: 'Ghana',        primary: '#006B3F', secondary: '#FCD116', trim: '#CE1126', pattern: 'solid', unlocked: true, type: 'country' },
  // AFC
  { id: 'japan',        name: 'Japan',        primary: '#000080', secondary: '#FFFFFF', trim: '#BC002D', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'south-korea',  name: 'South Korea',  primary: '#C60C30', secondary: '#003478', trim: '#FFFFFF', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'saudi-arabia', name: 'Saudi Arabia', primary: '#006C35', secondary: '#FFFFFF', trim: '#FFFFFF', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'iran',         name: 'Iran',         primary: '#239F40', secondary: '#FFFFFF', trim: '#DA0000', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'australia',    name: 'Australia',    primary: '#FFD700', secondary: '#00843D', trim: '#003DA5', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'qatar',        name: 'Qatar',        primary: '#8D1B3D', secondary: '#FFFFFF', trim: '#8D1B3D', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'iraq',         name: 'Iraq',         primary: '#007A3D', secondary: '#FFFFFF', trim: '#CE1126', pattern: 'solid', unlocked: true, type: 'country' },
  { id: 'uzbekistan',   name: 'Uzbekistan',   primary: '#1EB4F0', secondary: '#FFFFFF', trim: '#1EBF8A', pattern: 'solid', unlocked: true, type: 'country' },
  // OFC
  { id: 'new-zealand',  name: 'New Zealand',  primary: '#FFFFFF', secondary: '#000000', trim: '#CC0000', pattern: 'solid', unlocked: true, type: 'country' },
]

export const DEFAULT_KIT_ID = 'england'

export function getKit(id: string): Kit {
  return KITS.find((k) => k.id === id) ?? KITS[0]
}

export const CLUB_KITS    = KITS
export const COUNTRY_KITS = KITS
