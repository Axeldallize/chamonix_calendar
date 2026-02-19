import { ROOMS, FLOORS } from '../data/rooms'
import { RoomCard } from './RoomCard'
import type { RoomSelection, BedConfig } from '../types'

interface FloorPlanProps {
  selectedRooms: RoomSelection[]
  onRoomToggle?: (roomName: string) => void
  onConfigChange?: (roomName: string, config: BedConfig) => void
  conflictingRooms?: Map<string, string>
  mode: 'view' | 'select'
}

export function FloorPlan({
  selectedRooms,
  onRoomToggle,
  onConfigChange,
  conflictingRooms = new Map(),
  mode,
}: FloorPlanProps) {
  const getSelectedConfig = (roomName: string): BedConfig | undefined => {
    return selectedRooms.find(r => r.name === roomName)?.config
  }

  const isSelected = (roomName: string): boolean => {
    return selectedRooms.some(r => r.name === roomName)
  }

  return (
    <div className="space-y-6">
      {FLOORS.map(floor => {
        const floorRooms = ROOMS.filter(r => r.floor === floor.level)

        if (floorRooms.length === 0 && floor.level === 0) {
          return (
            <div key={floor.level} className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-20 text-right">
                  <span className="text-xs font-medium text-wood-500 uppercase tracking-wider">
                    {floor.name}
                  </span>
                </div>
                <div className="flex-1 h-px bg-wood-200" />
              </div>
              <div className="ml-24">
                <div className="bg-wood-50 border border-wood-200 border-dashed rounded-xl p-4 text-center text-wood-500">
                  <p className="text-sm">{floor.description}</p>
                  <p className="text-xs mt-1 text-wood-400">Pas de chambres</p>
                </div>
              </div>
            </div>
          )
        }

        if (floorRooms.length === 0) return null

        return (
          <div key={floor.level} className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-20 text-right">
                <span className="text-xs font-medium text-wood-500 uppercase tracking-wider">
                  {floor.name}
                </span>
              </div>
              <div className="flex-1 h-px bg-wood-200" />
            </div>
            <div className="ml-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {floorRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  selected={isSelected(room.name)}
                  config={getSelectedConfig(room.name)}
                  onSelect={() => onRoomToggle?.(room.name)}
                  onConfigChange={(config) => onConfigChange?.(room.name, config)}
                  disabled={conflictingRooms.has(room.name)}
                  occupiedBy={conflictingRooms.get(room.name)}
                  mode={mode}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
