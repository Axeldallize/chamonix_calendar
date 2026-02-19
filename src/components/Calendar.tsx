import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Booking } from '../types'
import { getMemberColor } from '../data/rooms'

interface CalendarProps {
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
  onNewBooking: () => void
}

export function Calendar({ bookings, onBookingClick, onNewBooking }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const weeks = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7))
    }
    return result
  }, [calendarDays])

  const getBookingsForDay = (day: Date): Booking[] => {
    return bookings.filter(booking => {
      const checkIn = parseISO(booking.check_in)
      const checkOut = parseISO(booking.check_out)
      // Check out day is not included (you leave that morning)
      return isWithinInterval(day, { start: checkIn, end: checkOut }) && !isSameDay(day, checkOut)
    })
  }

  const getBookingPosition = (booking: Booking, day: Date, weekDays: Date[]) => {
    const checkIn = parseISO(booking.check_in)
    const checkOut = parseISO(booking.check_out)
    const weekStart = weekDays[0]
    const weekEnd = weekDays[6]

    const isStartInWeek = isWithinInterval(checkIn, { start: weekStart, end: weekEnd })
    const isEndInWeek = isWithinInterval(checkOut, { start: weekStart, end: weekEnd })

    const startDayIndex = isStartInWeek
      ? weekDays.findIndex(d => isSameDay(d, checkIn))
      : 0
    const endDayIndex = isEndInWeek
      ? weekDays.findIndex(d => isSameDay(d, checkOut))
      : 7

    const isFirstDay = isSameDay(day, checkIn) || isSameDay(day, weekStart)

    return {
      startDayIndex,
      endDayIndex,
      span: endDayIndex - startDayIndex,
      isFirstDay,
      isStartInWeek,
      isEndInWeek,
    }
  }

  const today = new Date()

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-wood-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-wood-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="font-display text-xl font-semibold text-charcoal capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-wood-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-wood-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-wood-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => {
          // Collect all bookings that span this week
          const weekBookings = new Map<string, { booking: Booking; position: ReturnType<typeof getBookingPosition> }>()

          week.forEach(day => {
            const dayBookings = getBookingsForDay(day)
            dayBookings.forEach(booking => {
              if (!weekBookings.has(booking.id)) {
                weekBookings.set(booking.id, {
                  booking,
                  position: getBookingPosition(booking, day, week),
                })
              }
            })
          })

          return (
            <div key={weekIndex} className="relative">
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {week.map(day => {
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isToday = isSameDay(day, today)
                  const dayBookings = getBookingsForDay(day)

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        min-h-[80px] sm:min-h-[100px] p-1 rounded-lg border transition-colors
                        ${isCurrentMonth ? 'bg-white border-wood-100' : 'bg-wood-50/50 border-transparent'}
                        ${isToday ? 'ring-2 ring-forest-400 ring-inset' : ''}
                      `}
                    >
                      <span
                        className={`
                          text-sm font-medium
                          ${isCurrentMonth ? 'text-charcoal' : 'text-wood-300'}
                          ${isToday ? 'text-forest-600' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Mobile: Show dots for bookings */}
                      <div className="sm:hidden flex flex-wrap gap-0.5 mt-1">
                        {dayBookings.slice(0, 3).map(booking => (
                          <div
                            key={booking.id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getMemberColor(booking.family_member) }}
                          />
                        ))}
                        {dayBookings.length > 3 && (
                          <span className="text-[10px] text-wood-400">+{dayBookings.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Booking bars (desktop) */}
              <div className="hidden sm:block absolute inset-0 pointer-events-none">
                <div className="relative h-full">
                  {Array.from(weekBookings.values()).map(({ booking, position }, idx) => {
                    if (!position.isFirstDay && position.startDayIndex !== 0) return null

                    const left = `calc(${(position.startDayIndex / 7) * 100}% + 4px)`
                    const width = `calc(${(position.span / 7) * 100}% - 8px)`
                    const top = `calc(28px + ${idx * 24}px)`

                    return (
                      <button
                        key={booking.id}
                        onClick={() => onBookingClick(booking)}
                        className="absolute h-5 rounded-md text-xs font-medium text-white truncate px-2 flex items-center pointer-events-auto hover:opacity-90 transition-opacity shadow-sm"
                        style={{
                          left,
                          width,
                          top,
                          backgroundColor: getMemberColor(booking.family_member),
                          borderRadius: position.isStartInWeek && position.isEndInWeek
                            ? '6px'
                            : position.isStartInWeek
                              ? '6px 0 0 6px'
                              : position.isEndInWeek
                                ? '0 6px 6px 0'
                                : '0',
                        }}
                      >
                        {position.isStartInWeek && booking.family_member}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {bookings.filter(b => {
        const checkIn = parseISO(b.check_in)
        const checkOut = parseISO(b.check_out)
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        return (
          isWithinInterval(checkIn, { start: monthStart, end: monthEnd }) ||
          isWithinInterval(checkOut, { start: monthStart, end: monthEnd }) ||
          (checkIn <= monthStart && checkOut >= monthEnd)
        )
      }).length === 0 && (
        <div className="text-center py-8 text-wood-500">
          <p className="mb-4">Pas de séjours prévus ce mois-ci</p>
          <p className="text-sm text-wood-400">C'est le moment de réserver un week-end ?</p>
        </div>
      )}

      {/* New booking button */}
      <div className="mt-6 flex justify-center">
        <button onClick={onNewBooking} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau séjour
        </button>
      </div>
    </div>
  )
}
