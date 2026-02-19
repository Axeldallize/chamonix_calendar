import type { Room, FamilyMember } from '../types'

export const ROOMS: Room[] = [
  // Floor 2 (top)
  {
    id: 'etoile',
    name: "L'Étoile",
    floor: 2,
    floorName: 'Étage 2',
    defaultConfig: '2_singles_fixed',
    configurable: false,
    description: '2 lits simples',
    capacity: 2,
  },
  {
    id: 'refuge',
    name: 'Le Refuge',
    floor: 2,
    floorName: 'Étage 2',
    defaultConfig: '3_singles',
    configurable: false,
    description: '3 lits simples',
    capacity: 3,
  },
  // Floor 1
  {
    id: 'suite',
    name: 'La Suite',
    floor: 1,
    floorName: 'Étage 1',
    defaultConfig: 'king',
    configurable: false,
    description: 'Lit king size (chambre principale)',
    capacity: 2,
  },
  {
    id: 'alpage',
    name: "L'Alpage",
    floor: 1,
    floorName: 'Étage 1',
    defaultConfig: 'king',
    configurable: true,
    description: '1 king OU 2 simples',
    capacity: 2,
  },
  {
    id: 'balcon',
    name: 'Le Balcon',
    floor: 1,
    floorName: 'Étage 1',
    defaultConfig: 'king',
    configurable: true,
    description: '1 king OU 2 simples',
    capacity: 2,
  },
  // Floor -1 (lower ground)
  {
    id: 'cocon',
    name: 'Le Cocon',
    floor: -1,
    floorName: 'Étage -1',
    defaultConfig: 'king',
    configurable: false,
    description: 'Lit king size',
    capacity: 2,
  },
  {
    id: 'marmottes',
    name: 'Les Marmottes',
    floor: -1,
    floorName: 'Étage -1',
    defaultConfig: '3_singles',
    configurable: false,
    description: '3 lits simples',
    capacity: 3,
  },
]

export const FLOORS = [
  { level: 2, name: 'Étage 2', description: 'Chambres amis' },
  { level: 1, name: 'Étage 1', description: 'Chambres principales' },
  { level: 0, name: 'Rez-de-chaussée', description: 'Salon, cuisine, entrée' },
  { level: -1, name: 'Étage -1', description: 'Chambres cocooning' },
]

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'axel', name: 'Axel', color: '#2D5016' },      // forest green
  { id: 'sibling1', name: 'Achille', color: '#C45B28' }, // terracotta
  { id: 'sibling2', name: 'Theodore', color: '#1E40AF' }, // blue
  { id: 'sibling3', name: 'Anastase', color: '#7C3AED' },  // purple
  { id: 'sibling4', name: 'Adrien', color: '#DC2626' }, // red
  { id: 'sibling5', name: 'Evangeline', color: '#A84D22' }, // mauve
  { id: 'sibling6', name: 'Hortense', color: '#E56F42' }, // ochre
  { id: 'sibling7', name: 'Clemence', color: '#48370B' }, // charcoal
  { id: 'parents', name: 'Eleonore', color: '#2F2508' }, // brown
]

export const getRoomsByFloor = (floor: number): Room[] => {
  return ROOMS.filter(room => room.floor === floor)
}

export const getRoomById = (id: string): Room | undefined => {
  return ROOMS.find(room => room.id === id)
}

export const getRoomByName = (name: string): Room | undefined => {
  return ROOMS.find(room => room.name === name)
}

export const getMemberColor = (memberName: string): string => {
  const member = FAMILY_MEMBERS.find(m => m.name === memberName)
  return member?.color ?? '#6B7280'
}

export const formatBedConfig = (config: string): string => {
  switch (config) {
    case 'king':
      return 'Lit King'
    case '2_singles':
    case '2_singles_fixed':
      return '2 Simples'
    case '3_singles':
      return '3 Simples'
    default:
      return config
  }
}

export const getTotalCapacity = (): number => {
  return ROOMS.reduce((sum, room) => sum + room.capacity, 0)
}
