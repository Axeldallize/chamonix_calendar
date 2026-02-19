import type { Room, BedConfig } from '../types'
import { formatBedConfig } from '../data/rooms'

interface RoomCardProps {
  room: Room
  selected?: boolean
  config?: BedConfig
  onSelect?: () => void
  onConfigChange?: (config: BedConfig) => void
  disabled?: boolean
  occupiedBy?: string
  mode: 'view' | 'select'
}

export function RoomCard({
  room,
  selected = false,
  config,
  onSelect,
  onConfigChange,
  disabled = false,
  occupiedBy,
  mode,
}: RoomCardProps) {
  const currentConfig = config ?? room.defaultConfig

  const getBedIcon = (cfg: BedConfig) => {
    switch (cfg) {
      case 'king':
        return (
          <svg className="w-6 h-4" viewBox="0 0 24 16" fill="currentColor">
            <rect x="1" y="4" width="22" height="10" rx="2" className="fill-current" />
            <rect x="3" y="2" width="18" height="4" rx="1" className="fill-current opacity-60" />
          </svg>
        )
      case '2_singles':
      case '2_singles_fixed':
        return (
          <div className="flex gap-1">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="4" width="14" height="10" rx="2" />
              <rect x="2" y="2" width="12" height="4" rx="1" className="opacity-60" />
            </svg>
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="4" width="14" height="10" rx="2" />
              <rect x="2" y="2" width="12" height="4" rx="1" className="opacity-60" />
            </svg>
          </div>
        )
      case '3_singles':
        return (
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <svg key={i} className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="4" width="14" height="10" rx="2" />
                <rect x="2" y="2" width="12" height="4" rx="1" className="opacity-60" />
              </svg>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const cardClasses = `
    relative rounded-xl p-4 transition-all cursor-pointer border-2
    ${disabled
      ? 'bg-wood-100 border-wood-200 opacity-60 cursor-not-allowed'
      : selected
        ? 'bg-forest-50 border-forest-500 shadow-warm-lg'
        : 'bg-white border-wood-200 hover:border-wood-400 hover:shadow-warm'
    }
  `

  return (
    <div
      className={cardClasses}
      onClick={() => !disabled && mode === 'select' && onSelect?.()}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-forest-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display font-semibold text-lg text-charcoal">
          {room.name}
        </h3>
        <div className={`${disabled ? 'text-wood-400' : selected ? 'text-forest-600' : 'text-wood-500'}`}>
          {getBedIcon(currentConfig)}
        </div>
      </div>

      <p className="text-sm text-wood-500 mb-2">
        {formatBedConfig(currentConfig)} · {room.capacity} pers.
      </p>

      {occupiedBy && (
        <div className="text-xs bg-terracotta-100 text-terracotta-700 px-2 py-1 rounded-md inline-block">
          Occupé par {occupiedBy}
        </div>
      )}

      {room.configurable && selected && mode === 'select' && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onConfigChange?.('king')
            }}
            className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-colors ${
              currentConfig === 'king'
                ? 'bg-forest-500 text-white'
                : 'bg-wood-100 text-wood-600 hover:bg-wood-200'
            }`}
          >
            King
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onConfigChange?.('2_singles')
            }}
            className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-colors ${
              currentConfig === '2_singles'
                ? 'bg-forest-500 text-white'
                : 'bg-wood-100 text-wood-600 hover:bg-wood-200'
            }`}
          >
            2 Simples
          </button>
        </div>
      )}
    </div>
  )
}
