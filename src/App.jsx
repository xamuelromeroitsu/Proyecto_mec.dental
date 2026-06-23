import { useState, useEffect } from 'react'
import Header from './components/Header'
import LandingView from './components/LandingView'
import LoginView from './components/LoginView'
import DashboardView from './components/DashboardView'
import { INITIAL_CAROUSEL_IMAGES, INITIAL_ORDERS } from './data/initialData'

export default function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [authData, setAuthData] = useState(null)
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [carouselImages] = useState(INITIAL_CAROUSEL_IMAGES)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    document.head.appendChild(link)
  }, [])

  const handleLogin = (user) => {
    setAuthData({ user, token: 'mock-jwt-token-93021948' })
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setAuthData(null)
    setCurrentView('landing')
  }

  const handleAddOrder = (newOrder) => {
    setOrders([newOrder, ...orders])
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-sky-200">
      <Header
        currentView={currentView}
        authData={authData}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      <main className="pt-28">
        {currentView === 'landing' && (
          <LandingView
            carouselImages={carouselImages}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}
        {currentView === 'login' && <LoginView onLoginSuccess={handleLogin} />}
        {currentView === 'dashboard' && <DashboardView orders={orders} onAddOrder={handleAddOrder} />}
      </main>
    </div>
  )
}
