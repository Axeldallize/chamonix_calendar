interface HeaderProps {
  currentView: 'calendar' | 'dashboard'
  onViewChange: (view: 'calendar' | 'dashboard') => void
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-wood-200 shadow-warm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={import.meta.env.BASE_URL + 'mountains.svg'}
                alt=""
                className="w-16 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-wood-700">
                Chalet Myosotis
              </h1>
              <p className="text-sm text-wood-500">Chamonix-Mont-Blanc</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => onViewChange('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'bg-forest-500 text-white'
                  : 'text-wood-600 hover:bg-wood-100'
              }`}
            >
              Calendrier
            </button>
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-forest-500 text-white'
                  : 'text-wood-600 hover:bg-wood-100'
              }`}
            >
              Vue Maman
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
