export type BedConfig = 'king' | '2_singles' | '3_singles' | '2_singles_fixed'

export interface Room {
  id: string
  name: string
  floor: number
  floorName: string
  defaultConfig: BedConfig
  configurable: boolean
  description: string
  capacity: number
}

export interface RoomSelection {
  name: string
  config: BedConfig
}

export interface Booking {
  id: string
  family_member: string
  check_in: string
  check_out: string
  guest_count: number
  notes: string | null
  rooms: RoomSelection[]
  created_at: string
  updated_at: string
}

export interface BookingInsert {
  family_member: string
  check_in: string
  check_out: string
  guest_count: number
  notes?: string | null
  rooms: RoomSelection[]
}

export interface FamilyMember {
  id: string
  name: string
  color: string
}
