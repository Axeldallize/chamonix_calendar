import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { Calendar } from './components/Calendar'
import { MomDashboard } from './components/MomDashboard'
import { BookingForm } from './components/BookingForm'
import { BookingDetail } from './components/BookingDetail'
import { Modal } from './components/Modal'
import { useBookings } from './hooks/useBookings'
import type { Booking, BookingInsert } from './types'

type View = 'calendar' | 'dashboard'
type ModalState =
  | { type: 'none' }
  | { type: 'new' }
  | { type: 'view'; booking: Booking }
  | { type: 'edit'; booking: Booking }

function App() {
  const [currentView, setCurrentView] = useState<View>('calendar')
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' })
  const [dateRange, setDateRange] = useState({ checkIn: '', checkOut: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    deleteBooking,
    getConflictingRooms,
  } = useBookings()

  const conflictingRooms = getConflictingRooms(
    dateRange.checkIn,
    dateRange.checkOut,
    modalState.type === 'edit' ? modalState.booking.id : undefined
  )

  const handleDateChange = useCallback((checkIn: string, checkOut: string) => {
    setDateRange({ checkIn, checkOut })
  }, [])

  const handleNewBooking = () => {
    setModalState({ type: 'new' })
  }

  const handleBookingClick = (booking: Booking) => {
    setModalState({ type: 'view', booking })
  }

  const handleEditBooking = () => {
    if (modalState.type === 'view') {
      setModalState({ type: 'edit', booking: modalState.booking })
    }
  }

  const handleCloseModal = () => {
    setModalState({ type: 'none' })
    setDateRange({ checkIn: '', checkOut: '' })
  }

  const handleSubmitBooking = async (data: BookingInsert) => {
    if (modalState.type === 'edit') {
      await updateBooking(modalState.booking.id, data)
    } else {
      await createBooking(data)
    }
    handleCloseModal()
  }

  const handleDeleteBooking = async () => {
    if (modalState.type === 'view') {
      setDeleteConfirm(modalState.booking.id)
    }
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteBooking(deleteConfirm)
      setDeleteConfirm(null)
      handleCloseModal()
    }
  }

  const getModalTitle = () => {
    switch (modalState.type) {
      case 'new':
        return 'Nouveau séjour'
      case 'view':
        return 'Détails du séjour'
      case 'edit':
        return 'Modifier le séjour'
      default:
        return ''
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="text-terracotta-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-charcoal mb-2">
            Erreur de connexion
          </h2>
          <p className="text-wood-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream bg-wood-grain">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest-500 border-t-transparent" />
          </div>
        ) : currentView === 'calendar' ? (
          <Calendar
            bookings={bookings}
            onBookingClick={handleBookingClick}
            onNewBooking={handleNewBooking}
          />
        ) : (
          <MomDashboard bookings={bookings} onBookingClick={handleBookingClick} />
        )}
      </main>

      {/* Booking Modal */}
      <Modal
        isOpen={modalState.type !== 'none'}
        onClose={handleCloseModal}
        title={getModalTitle()}
      >
        {modalState.type === 'view' && (
          <BookingDetail
            booking={modalState.booking}
            onEdit={handleEditBooking}
            onDelete={handleDeleteBooking}
            onClose={handleCloseModal}
          />
        )}
        {(modalState.type === 'new' || modalState.type === 'edit') && (
          <BookingForm
            booking={modalState.type === 'edit' ? modalState.booking : undefined}
            conflictingRooms={conflictingRooms}
            onSubmit={handleSubmitBooking}
            onCancel={handleCloseModal}
            onDateChange={handleDateChange}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression"
      >
        <div className="text-center py-4">
          <svg
            className="w-12 h-12 mx-auto text-terracotta-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <p className="text-charcoal mb-6">
            Êtes-vous sûr de vouloir supprimer ce séjour ?
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
              Annuler
            </button>
            <button onClick={confirmDelete} className="btn-danger">
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="border-t border-wood-200 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-wood-500">
          <p>Chalet Durand-Allize · Chamonix-Mont-Blanc</p>
        </div>
      </footer>
    </div>
  )
}

export default App
