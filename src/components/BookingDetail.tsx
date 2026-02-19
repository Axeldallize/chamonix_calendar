import { format, parseISO, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FloorPlan } from './FloorPlan'
import { getMemberColor, formatBedConfig } from '../data/rooms'
import type { Booking } from '../types'

interface BookingDetailProps {
  booking: Booking
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export function BookingDetail({ booking, onEdit, onDelete, onClose }: BookingDetailProps) {
  const checkIn = parseISO(booking.check_in)
  const checkOut = parseISO(booking.check_out)
  const nights = differenceInDays(checkOut, checkIn)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-semibold"
          style={{ backgroundColor: getMemberColor(booking.family_member) }}
        >
          {booking.family_member.charAt(0)}
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal">
            Séjour de {booking.family_member}
          </h2>
          <p className="text-wood-500">
            {booking.guest_count} personne{booking.guest_count > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-wood-50 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-wood-500 uppercase tracking-wider mb-1">Arrivée</p>
            <p className="font-semibold text-charcoal">
              {format(checkIn, 'EEEE d MMMM', { locale: fr })}
            </p>
          </div>
          <div>
            <p className="text-xs text-wood-500 uppercase tracking-wider mb-1">Départ</p>
            <p className="font-semibold text-charcoal">
              {format(checkOut, 'EEEE d MMMM', { locale: fr })}
            </p>
          </div>
        </div>
        <p className="text-sm text-wood-600 mt-3 text-center">
          {nights} nuit{nights > 1 ? 's' : ''}
        </p>
      </div>

      {/* Rooms */}
      <div>
        <h3 className="font-display font-semibold text-lg text-charcoal mb-3">
          Chambres réservées
        </h3>
        <div className="space-y-2">
          {booking.rooms.map((room, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-forest-50 border border-forest-200 rounded-lg px-4 py-3"
            >
              <span className="font-medium text-forest-800">{room.name}</span>
              <span className="text-sm text-forest-600">{formatBedConfig(room.config)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floor plan visualization */}
      <div>
        <h3 className="font-display font-semibold text-lg text-charcoal mb-3">
          Plan du chalet
        </h3>
        <div className="opacity-75 pointer-events-none">
          <FloorPlan selectedRooms={booking.rooms} mode="view" />
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div>
          <h3 className="font-display font-semibold text-lg text-charcoal mb-2">Notes</h3>
          <p className="text-wood-600 bg-wood-50 rounded-lg p-3">{booking.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-between pt-4 border-t border-wood-100">
        <button onClick={onDelete} className="btn-danger">
          Supprimer
        </button>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary">
            Fermer
          </button>
          <button onClick={onEdit} className="btn-primary">
            Modifier
          </button>
        </div>
      </div>
    </div>
  )
}
