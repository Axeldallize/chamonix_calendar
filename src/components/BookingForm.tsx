import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { FloorPlan } from './FloorPlan'
import { FAMILY_MEMBERS, getRoomByName } from '../data/rooms'
import type { Booking, BookingInsert, RoomSelection, BedConfig } from '../types'

interface BookingFormProps {
  booking?: Booking
  conflictingRooms: Map<string, string>
  onSubmit: (data: BookingInsert) => Promise<void>
  onCancel: () => void
  onDateChange: (checkIn: string, checkOut: string) => void
}

export function BookingForm({
  booking,
  conflictingRooms,
  onSubmit,
  onCancel,
  onDateChange,
}: BookingFormProps) {
  const [familyMember, setFamilyMember] = useState(booking?.family_member ?? '')
  const [checkIn, setCheckIn] = useState(booking?.check_in ?? format(new Date(), 'yyyy-MM-dd'))
  const [checkOut, setCheckOut] = useState(
    booking?.check_out ?? format(addDays(new Date(), 2), 'yyyy-MM-dd')
  )
  const [guestCount, setGuestCount] = useState(booking?.guest_count ?? 2)
  const [notes, setNotes] = useState(booking?.notes ?? '')
  const [selectedRooms, setSelectedRooms] = useState<RoomSelection[]>(booking?.rooms ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dateError = checkIn && checkOut && checkOut <= checkIn
    ? 'La date de départ doit être après la date d\'arrivée'
    : null

  useEffect(() => {
    onDateChange(checkIn, checkOut)
  }, [checkIn, checkOut, onDateChange])

  const handleRoomToggle = (roomName: string) => {
    setSelectedRooms(prev => {
      const existing = prev.find(r => r.name === roomName)
      if (existing) {
        return prev.filter(r => r.name !== roomName)
      }
      const room = getRoomByName(roomName)
      if (!room) return prev
      return [...prev, { name: roomName, config: room.defaultConfig }]
    })
  }

  const handleConfigChange = (roomName: string, config: BedConfig) => {
    setSelectedRooms(prev =>
      prev.map(r => (r.name === roomName ? { ...r, config } : r))
    )
  }

  const calculateCapacity = (): number => {
    return selectedRooms.reduce((sum, selection) => {
      const room = getRoomByName(selection.name)
      return sum + (room?.capacity ?? 0)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!familyMember) {
      setError('Veuillez sélectionner un membre de la famille')
      return
    }
    if (selectedRooms.length === 0) {
      setError('Veuillez sélectionner au moins une chambre')
      return
    }
    if (checkIn >= checkOut) {
      setError('La date de départ doit être après la date d\'arrivée')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        family_member: familyMember,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guestCount,
        notes: notes || null,
        rooms: selectedRooms,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-terracotta-50 border border-terracotta-200 text-terracotta-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Family member selection */}
      <div>
        <label className="label">Qui réserve ?</label>
        <select
          value={familyMember}
          onChange={e => setFamilyMember(e.target.value)}
          className="input"
          required
        >
          <option value="">Sélectionner...</option>
          {FAMILY_MEMBERS.map(member => (
            <option key={member.id} value={member.name}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Arrivée</label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              className={`input ${dateError ? 'border-terracotta-500 focus:border-terracotta-500 focus:ring-terracotta-100' : ''}`}
              required
            />
          </div>
          <div>
            <label className="label">Départ</label>
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              className={`input ${dateError ? 'border-terracotta-500 focus:border-terracotta-500 focus:ring-terracotta-100' : ''}`}
              required
            />
          </div>
        </div>
        {dateError && (
          <p className="mt-2 text-sm text-terracotta-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {dateError}
          </p>
        )}
      </div>

      {/* Guest count */}
      <div>
        <label className="label">Nombre de personnes</label>
        <input
          type="number"
          min={1}
          max={15}
          value={guestCount}
          onChange={e => setGuestCount(parseInt(e.target.value) || 1)}
          className="input w-24"
        />
        <p className="text-xs text-wood-500 mt-1">
          Capacité sélectionnée: {calculateCapacity()} / {guestCount} personnes
          {guestCount > calculateCapacity() && (
            <span className="text-terracotta-500 ml-1">(chambres insuffisantes)</span>
          )}
        </p>
      </div>

      {/* Room selection */}
      <div>
        <label className="label mb-3">Chambres</label>
        <FloorPlan
          selectedRooms={selectedRooms}
          onRoomToggle={handleRoomToggle}
          onConfigChange={handleConfigChange}
          conflictingRooms={conflictingRooms}
          mode="select"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes (optionnel)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ex: Marie + 2 amies du travail"
          className="input min-h-[80px]"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-wood-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting || !!dateError}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Enregistrement...' : booking ? 'Modifier' : 'Réserver'}
        </button>
      </div>
    </form>
  )
}
