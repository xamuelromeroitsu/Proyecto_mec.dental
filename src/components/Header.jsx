export default function Header({ currentView, authData, onNavigate, onLogout }) {
  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md shadow-sm z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <i className="fa-solid fa-tooth text-3xl text-sky-500"></i>
            <span className="font-bold text-2xl text-slate-900 tracking-tight">Nova<span className="text-sky-500">Dent</span></span>
            <span className="bg-sky-50 text-sky-600 text-xs font-semibold px-2.5 py-0.5 rounded border border-sky-100 ml-1">LAB</span>
          </div>

          <div className="flex items-center gap-6">
            {currentView === 'landing' ? (
              <>
                <a href="#inicio" className="hidden md:inline-block text-slate-600 hover:text-sky-500 transition-colors font-medium">Inicio</a>
                <a href="#casos" className="hidden md:inline-block text-slate-600 hover:text-sky-500 transition-colors font-medium">Casos Clínicos</a>
                <a href="#servicios" className="hidden md:inline-block text-slate-600 hover:text-sky-500 transition-colors font-medium">Especialidades</a>
                <a href="#nosotros" className="hidden md:inline-block text-slate-600 hover:text-sky-500 transition-colors font-medium">Nosotros</a>
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-sky-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-sky-600 transition-all shadow-md shadow-sky-200 flex items-center gap-2"
                >
                  <i className="fa-solid fa-user-md text-sm"></i> Portal Odontólogo
                </button>
              </>
            ) : currentView === 'login' ? (
              <button
                onClick={() => onNavigate('landing')}
                className="text-slate-600 hover:text-sky-500 transition-colors font-medium flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i> Volver al Inicio
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="font-bold text-slate-950 text-sm">{authData?.user?.name}</p>
                  <p className="text-xs text-sky-500">{authData?.user?.clinic}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
