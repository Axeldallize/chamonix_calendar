import { format, parseISO, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getMemberColor, formatBedConfig, ROOMS, FLOORS } from '../data/rooms'
import type { Booking } from '../types'

interface MomDashboardProps {
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
}

export function MomDashboard({ bookings, onBookingClick }: MomDashboardProps) {
  const upcomingBookings = bookings
    .filter(b => parseISO(b.check_out) >= new Date())
    .sort((a, b) => parseISO(a.check_in).getTime() - parseISO(b.check_in).getTime())

  const exportToCSV = () => {
    const headers = ['Arrivée', 'Départ', 'Nuits', 'Famille', 'Personnes', 'Chambres', 'Configuration', 'Notes']
    const rows = upcomingBookings.map(b => {
      const checkIn = parseISO(b.check_in)
      const checkOut = parseISO(b.check_out)
      const nights = differenceInDays(checkOut, checkIn)
      const roomNames = b.rooms.map(r => r.name).join(', ')
      const roomConfigs = b.rooms.map(r => `${r.name}: ${formatBedConfig(r.config)}`).join('; ')

      return [
        format(checkIn, 'dd/MM/yyyy'),
        format(checkOut, 'dd/MM/yyyy'),
        nights.toString(),
        b.family_member,
        b.guest_count.toString(),
        roomNames,
        roomConfigs,
        b.notes || '',
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sejours-chalet-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const copyToClipboard = () => {
    const text = upcomingBookings.map(b => {
      const checkIn = parseISO(b.check_in)
      const checkOut = parseISO(b.check_out)
      const nights = differenceInDays(checkOut, checkIn)
      const rooms = b.rooms.map(r => `${r.name} (${formatBedConfig(r.config)})`).join(', ')

      return `${format(checkIn, 'd MMM', { locale: fr })} → ${format(checkOut, 'd MMM', { locale: fr })} (${nights}n)
${b.family_member} · ${b.guest_count} pers.
Chambres: ${rooms}
${b.notes ? `Notes: ${b.notes}` : ''}`
    }).join('\n\n---\n\n')

    navigator.clipboard.writeText(text)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-charcoal">
          Prochains séjours
        </h2>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="text-sm px-3 py-1.5 text-wood-600 hover:bg-wood-100 rounded-lg transition-colors"
          >
            Copier
          </button>
          <button
            onClick={exportToCSV}
            className="text-sm px-3 py-1.5 text-wood-600 hover:bg-wood-100 rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {upcomingBookings.length === 0 ? (
        <div className="text-center py-12 text-wood-500">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-wood-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>Aucun séjour prévu</p>
          <p className="text-sm mt-1 text-wood-400">Le chalet vous attend !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBookings.map(booking => {
            const checkIn = parseISO(booking.check_in)
            const checkOut = parseISO(booking.check_out)
            const nights = differenceInDays(checkOut, checkIn)
            const isOngoing = checkIn <= new Date() && checkOut >= new Date()

            return (
              <button
                key={booking.id}
                onClick={() => onBookingClick(booking)}
                className="w-full text-left bg-white border border-wood-200 rounded-xl p-4 hover:border-wood-400 hover:shadow-warm transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Color indicator */}
                  <div
                    className="w-1 h-full min-h-[60px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: getMemberColor(booking.family_member) }}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-charcoal">
                          {booking.family_member}
                        </span>
                        {isOngoing && (
                          <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">
                            En cours
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-wood-500">
                        {booking.guest_count} pers.
                      </span>
                    </div>

                    {/* Dates */}
                    <p className="text-sm text-wood-600 mb-2">
                      {format(checkIn, 'EEE d MMM', { locale: fr })} →{' '}
                      {format(checkOut, 'EEE d MMM', { locale: fr })}
                      <span className="text-wood-400 ml-2">({nights} nuit{nights > 1 ? 's' : ''})</span>
                    </p>

                    {/* Rooms */}
                    <div className="flex flex-wrap gap-1.5">
                      {booking.rooms.map((room, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-wood-100 text-wood-600 px-2 py-1 rounded-md"
                        >
                          {room.name}
                          <span className="text-wood-400 ml-1">
                            ({formatBedConfig(room.config)})
                          </span>
                        </span>
                      ))}
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <p className="text-xs text-wood-500 mt-2 italic truncate">
                        {booking.notes}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {upcomingBookings.length > 0 && (
        <div className="mt-6 pt-4 border-t border-wood-100 text-center text-sm text-wood-500">
          {upcomingBookings.length} séjour{upcomingBookings.length > 1 ? 's' : ''} à venir
        </div>
      )}

      {/* Room Legend */}
      <div className="mt-8 pt-6 border-t border-wood-200">
        <h3 className="font-display text-lg font-semibold text-charcoal mb-4">
          Plan des chambres
        </h3>
        <div className="space-y-4">
          {FLOORS.filter(floor => floor.level !== 0).map(floor => {
            const floorRooms = ROOMS.filter(r => r.floor === floor.level)
            if (floorRooms.length === 0) return null

            return (
              <div key={floor.level} className="bg-wood-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-wood-600 uppercase tracking-wider">
                    {floor.name}
                  </span>
                  <span className="text-xs text-wood-400">
                    {floor.description}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {floorRooms.map(room => (
                    <div
                      key={room.id}
                      className="bg-white rounded-md px-3 py-2 border border-wood-100"
                    >
                      <span className="font-medium text-charcoal text-sm">
                        {room.name}
                      </span>
                      <span className="text-xs text-wood-500 ml-2">
                        {room.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
