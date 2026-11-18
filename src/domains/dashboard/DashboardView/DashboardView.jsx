import { useState } from 'react'
import OrderFeed from '../OrderFeed/OrderFeed'
import NewOrderForm from '../NewOrderForm/NewOrderForm'
import { useSession } from '../../../app/SessionContext'
import './DashboardView.css'

/* Chips de búsqueda: cada clave agrupa tipos afines del catálogo
   (lib/workTypes) + las etiquetas legadas de órdenes previas.
   El filtrado es SERVER-SIDE: setGroup() pide la página 1 del grupo. */
const STORIES = [
  { key: 'all', label: 'Todos', icon: 'fa-layer-group' },
  { key: 'fija', label: 'Fija', icon: 'fa-tooth' },
  { key: 'carillas', label: 'Carillas', icon: 'fa-face-smile' },
  { key: 'removible', label: 'Removible', icon: 'fa-teeth-open' },
  { key: 'grillz', label: 'Grillz', icon: 'fa-gem' },
  { key: 'ortodoncia', label: 'Ortodoncia', icon: 'fa-bezier-curve' },
  { key: 'proteccion', label: 'Férulas', icon: 'fa-shield-halved' },
]

export default function DashboardView({ onAddOrder, authData }) {
  // El feed vive en SessionContext (máquina paginada): órdenes acumuladas,
  // ¿hay más?, carga en vuelo, stats server-side y acciones.
  const { orders, hasMore, loading, stats, loadMore, setGroup } = useSession()
  const [view, setView] = useState('feed')
  const [activeFilter, setActiveFilter] = useState('all')

  /** Cambio de chip → recarga la página 1 de ese grupo desde el servidor. */
  const changeFilter = (key) => {
    setActiveFilter(key)
    setGroup(key)
  }

  return (
    <div className="dashboard">
      <div className="profile">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar">
            <i className={`fa-solid ${authData?.user?.rol === 'tecnico' || authData?.user?.rol === 'tecnico_admin' ? 'fa-screwdriver-wrench' : 'fa-user-doctor'}`}></i>
          </div>
          <div className="profile-data">
            <h2 className="profile-name">{authData?.user?.name || 'Usuario'}</h2>
            <p className="profile-clinic">
              {authData?.user?.clinic ||
                (authData?.user?.rol === 'tecnico' || authData?.user?.rol === 'tecnico_admin'
                  ? 'Laboratorio Dental'
                  : 'Sin clínica asignada')}
            </p>
            <p className="profile-specialty">
              {authData?.user?.rol === 'tecnico' || authData?.user?.rol === 'tecnico_admin'
                ? 'Técnico en Mecánica Dental'
                : 'Odontología General · Estética Dental'}
            </p>
          </div>
          <div className="profile-stats">
            {/* Contadores server-side (fetchOrderStats): NO dependen de las
                filas paginadas en pantalla — reflejan TODA la base visible. */}
            <div className="profile-stat">
              <span className="profile-stat-value">{stats.total}</span>
              <span className="profile-stat-label">Órdenes</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{stats.enCurso}</span>
              <span className="profile-stat-label">En curso</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{stats.completadas}</span>
              <span className="profile-stat-label">Completadas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stories">
        {STORIES.map(s => (
          <button
            key={s.key}
            onClick={() => changeFilter(s.key)}
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
          {/* Feed paginado por mes: el chip ya filtra en el servidor, así que
              `orders` llega listo (sin filtrar en cliente). */}
          <OrderFeed
            orders={orders}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={loadMore}
          />

          <button onClick={() => setView('new-order')} className="fab">
            <i className="fa-solid fa-plus"></i>
          </button>
        </>
      )}

      {view === 'new-order' && (
        <NewOrderForm
          onAddOrder={(o) => { onAddOrder(o); setView('feed') }}
          onCancel={() => setView('feed')}
          clinica={authData?.clinica}
        />
      )}
    </div>
  )
}
