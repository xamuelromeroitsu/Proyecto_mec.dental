import { useState, useEffect } from 'react'
import Header from './shared/Header/Header'
import Presentation from './domains/portfolio/components/Presentation/Presentation'
import LoginView from './domains/auth/LoginView/LoginView'
import DashboardView from './domains/dashboard/DashboardView/DashboardView'
import { INITIAL_CAROUSEL_IMAGES, INITIAL_ORDERS } from './data/initialData'
import './styles/base.css'

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
    <div className="app">
      <Header
        currentView={currentView}
        authData={authData}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {currentView === 'landing' && (
          <Presentation
            carouselImages={carouselImages}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}
        {currentView === 'login' && <LoginView onLoginSuccess={handleLogin} />}
        {currentView === 'dashboard' && (
          <DashboardView orders={orders} onAddOrder={handleAddOrder} />
        )}
      </main>
    </div>
  )
}
