import { useState, useEffect, useCallback } from 'react'
import { supabase, bookingsApi } from '../lib/supabase'
import type { Booking, BookingInsert, RoomSelection } from '../types'
import { areIntervalsOverlapping, parseISO } from 'date-fns'

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await bookingsApi.getAll()
      setBookings(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()

    // Set up realtime subscription
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          // Refetch all bookings on any change for simplicity
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchBookings])

  const createBooking = async (booking: BookingInsert): Promise<Booking> => {
    const newBooking = await bookingsApi.create(booking)
    setBookings(prev => [...prev, newBooking].sort(
      (a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
    ))
    return newBooking
  }

  const updateBooking = async (id: string, booking: Partial<BookingInsert>): Promise<Booking> => {
    const updated = await bookingsApi.update(id, booking)
    setBookings(prev =>
      prev.map(b => (b.id === id ? updated : b))
    )
    return updated
  }

  const deleteBooking = async (id: string): Promise<void> => {
    await bookingsApi.delete(id)
    setBookings(prev => prev.filter(b => b.id !== id))
  }

  const getBookingsForDateRange = useCallback(
    (startDate: Date, endDate: Date): Booking[] => {
      return bookings.filter(booking => {
        const bookingStart = parseISO(booking.check_in)
        const bookingEnd = parseISO(booking.check_out)
        return areIntervalsOverlapping(
          { start: bookingStart, end: bookingEnd },
          { start: startDate, end: endDate }
        )
      })
    },
    [bookings]
  )

  const getConflictingRooms = useCallback(
    (checkIn: string, checkOut: string, excludeBookingId?: string): Map<string, string> => {
      const conflicts = new Map<string, string>()
      const start = parseISO(checkIn)
      const end = parseISO(checkOut)

      bookings
        .filter(b => b.id !== excludeBookingId)
        .forEach(booking => {
          const bookingStart = parseISO(booking.check_in)
          const bookingEnd = parseISO(booking.check_out)

          if (areIntervalsOverlapping(
            { start: bookingStart, end: bookingEnd },
            { start, end }
          )) {
            booking.rooms.forEach((room: RoomSelection) => {
              conflicts.set(room.name, booking.family_member)
            })
          }
        })

      return conflicts
    },
    [bookings]
  )

  const getUpcomingBookings = useCallback((): Booking[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookings.filter(b => parseISO(b.check_out) >= today)
  }, [bookings])

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingsForDateRange,
    getConflictingRooms,
    getUpcomingBookings,
    refresh: fetchBookings,
  }
}
