import { useState } from 'react'
import OrderFeed from '../OrderFeed/OrderFeed'
import NewOrderForm from '../NewOrderForm/NewOrderForm'
import './DashboardView.css'

const STORIES = [
  { key: 'all', label: 'Todos', icon: 'fa-layer-group' },
  { key: 'Prótesis Fija', label: 'Fija', icon: 'fa-teeth' },
  { key: 'Prótesis Removible', label: 'Removible', icon: 'fa-teeth-open' },
  { key: 'Ortodoncia / Alineadores', label: 'Ortodoncia', icon: 'fa-bezier-curve' },
]

export default function DashboardView({ orders, onAddOrder, authData }) {
  const [view, setView] = useState('feed')
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.tipo === activeFilter)

  const completedCount = orders.filter(o => o.estado === 'Completado').length
  const inProgressCount = orders.filter(o => o.estado === 'En Proceso').length

  return (
    <div className="dashboard">
      <div className="profile">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar">
            <i className="fa-solid fa-user-md"></i>
          </div>
          <div className="profile-data">
            <h2 className="profile-name">{authData?.user?.name || 'Dr. Alejandro Martínez'}</h2>
            <p className="profile-clinic">{authData?.user?.clinic || 'Clínica Dental Esthetic'}</p>
            <p className="profile-specialty">Odontología General · Estética Dental</p>
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{orders.length}</span>
              <span className="profile-stat-label">Órdenes</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{inProgressCount}</span>
              <span className="profile-stat-label">En curso</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{completedCount}</span>
              <span className="profile-stat-label">Completadas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stories">
        {STORIES.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveFilter(s.key)}
            className={`story-btn ${activeFilter === s.key ? 'story-btn--active' : ''}`}
          >
            <div className="story-circle">
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <span className="story-label">{s.label}</span>
          </button>
        ))}
      </div>

      {view === 'feed' && (
        <>
          <OrderFeed orders={filteredOrders} />

          <button onClick={() => setView('new-order')} className="fab">
            <i className="fa-solid fa-plus"></i>
          </button>
        </>
      )}

      {view === 'new-order' && (
        <NewOrderForm
          onAddOrder={(o) => { onAddOrder(o); setView('feed') }}
          onCancel={() => setView('feed')}
        />
      )}
    </div>
  )
}
