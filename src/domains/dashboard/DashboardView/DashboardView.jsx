import { useState } from 'react'
import OrderList from '../OrderList/OrderList'
import NewOrderForm from '../NewOrderForm/NewOrderForm'
import './DashboardView.css'

export default function DashboardView({ orders, onAddOrder }) {
  const [view, setView] = useState('list')

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Área Privada de Clínicas</h2>
          <p className="dashboard-subtitle">
            Gestione solicitudes de trabajo, envíe archivos STL digitales y
            rastree el estado en tiempo real.
          </p>
        </div>
        <div className="dashboard-tabs">
          <button
            onClick={() => setView('list')}
            className={`dashboard-tab ${view === 'list' ? 'dashboard-tab--active' : 'dashboard-tab--inactive'}`}
          >
            <i className="fa-solid fa-clipboard-list"></i>
            <span className="dashboard-tab-label">Historial de Órdenes</span>
            <span className="dashboard-tab-short">Órdenes</span>
          </button>
          <button
            onClick={() => setView('new-order')}
            className={`dashboard-tab ${view === 'new-order' ? 'dashboard-tab--active' : 'dashboard-tab--inactive'}`}
          >
            <i className="fa-solid fa-file-invoice"></i>
            <span className="dashboard-tab-label">Nueva Orden</span>
            <span className="dashboard-tab-short">Crear</span>
          </button>
        </div>
      </div>

      {view === 'list' && <OrderList orders={orders} />}
      {view === 'new-order' && (
        <NewOrderForm
          onAddOrder={onAddOrder}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  )
}
