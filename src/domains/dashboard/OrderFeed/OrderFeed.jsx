import './OrderFeed.css'

const STATUS_CONFIG = {
  'Completado': { icon: 'fa-circle-check', cls: 'card-status--completed' },
  'En Proceso': { icon: 'fa-spinner', cls: 'card-status--progress' },
  'Recibido': { icon: 'fa-inbox', cls: 'card-status--received' },
}

export default function OrderFeed({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="feed-empty">
        <div className="feed-empty-icon">
          <i className="fa-solid fa-folder-open"></i>
        </div>
        <p className="feed-empty-text">No hay órdenes que mostrar</p>
      </div>
    )
  }

  return (
    <div className="feed">
      {orders.map(ord => {
        const status = STATUS_CONFIG[ord.estado] || STATUS_CONFIG['Recibido']
        return (
          <article key={ord.id} className="feed-card">
            <div className="feed-card-header">
              <div className="feed-card-id">
                <i className="fa-solid fa-hashtag"></i>
                {ord.id}
              </div>
              <span className={`feed-status ${status.cls}`}>
                <i className={`fa-solid ${status.icon}`}></i>
                {ord.estado}
              </span>
            </div>

            <div className="feed-card-body">
              <div className="feed-patient">
                <div className="feed-patient-avatar">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div>
                  <p className="feed-patient-name">{ord.paciente}</p>
                  <p className="feed-patient-clinic">{ord.clinica}</p>
                </div>
              </div>

              <div className="feed-details">
                <div className="feed-detail">
                  <i className="fa-solid fa-toolbox"></i>
                  <span>{ord.tipo}</span>
                </div>
                <div className="feed-detail">
                  <i className="fa-solid fa-flask"></i>
                  <span>{ord.material}</span>
                </div>
                <div className="feed-detail">
                  <i className="fa-solid fa-palette"></i>
                  <span>{ord.color}</span>
                </div>
              </div>

              <div className="feed-teeth">
                <i className="fa-solid fa-tooth"></i>
                {ord.piezas.map((t, i) => (
                  <span key={i} className="feed-tooth-tag">{t}</span>
                ))}
              </div>
            </div>

            <div className="feed-card-footer">
              <i className="fa-regular fa-calendar"></i>
              <span>{ord.fecha}</span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
