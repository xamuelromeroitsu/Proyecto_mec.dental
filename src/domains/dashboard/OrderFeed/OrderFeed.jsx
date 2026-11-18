import './OrderFeed.css'

const STATUS_CONFIG = {
  'Recibido': { icon: 'fa-inbox', cls: 'card-status--received' },
  'En Diseño': { icon: 'fa-pen-ruler', cls: 'card-status--progress' },
  'En Fabricación': { icon: 'fa-spinner', cls: 'card-status--progress' },
  'Entregado': { icon: 'fa-circle-check', cls: 'card-status--completed' },
  'Cancelado': { icon: 'fa-ban', cls: 'card-status--completed' },
  // Estados del modo demo (INITIAL_ORDERS)
  'En Proceso': { icon: 'fa-spinner', cls: 'card-status--progress' },
  'Completado': { icon: 'fa-circle-check', cls: 'card-status--completed' },
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/**
 * Agrupa las órdenes por MES de su fecha (AAAA-MM) para clasificar el feed
 * visualmente: cada bloque lleva su encabezado ("Noviembre 2026").
 *
 * QUÉ: recibe la lista ya ordenada DESC (el servidor ordena por
 * fecha_ingreso) y devuelve [{ mes: 'AAAA-MM', etiqueta, ordenes: [...] }].
 *
 * POR QUÉ: con la base creciendo, un feed plano infinito no deja ver dónde
 * termina un mes; los headers actúan como anclas visuales y de escaneo.
 * Las órdenes sin fecha válida caen en el grupo "Sin fecha" (al final).
 */
function groupByMonth(orders) {
  const groups = new Map()
  for (const ord of orders) {
    const key = typeof ord.fecha === 'string' && /^\d{4}-\d{2}/.test(ord.fecha)
      ? ord.fecha.slice(0, 7)
      : 'sin-fecha'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(ord)
  }
  return [...groups.entries()].map(([mes, ordenes]) => ({
    mes,
    etiqueta: mes === 'sin-fecha'
      ? 'Sin fecha'
      : `${MESES[Number(mes.slice(5, 7)) - 1]} ${mes.slice(0, 4)}`,
    ordenes,
  }))
}

export default function OrderFeed({ orders, hasMore = false, loading = false, onLoadMore }) {
  if (orders.length === 0) {
    return (
      <div className="feed-empty">
        <div className="feed-empty-icon" data-testid="feed-empty-icon">
          <i className="fa-solid fa-folder-open"></i>
        </div>
        <p className="feed-empty-text">No hay órdenes que mostrar</p>
      </div>
    )
  }

  const groups = groupByMonth(orders)

  return (
    <div className="feed">
      {groups.map((group) => (
        <section key={group.mes} className="feed-month" data-testid="feed-month">
          {/* Encabezado del mes: clasificación visual por fecha */}
          <h3 className="feed-month-label">
            <i className="fa-regular fa-calendar" aria-hidden="true"></i>
            {group.etiqueta}
            <span className="feed-month-count">{group.ordenes.length}</span>
          </h3>

          <div className="feed-month-grid">
            {group.ordenes.map(ord => {
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
        </section>
      ))}

      {/* "Cargar más" — paginación explícita (no scroll infinito): el
          usuario decide si baja el histórico. Escondido mientras carga. */}
      {hasMore && (
        <div className="feed-load-more">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="feed-load-more-btn"
            data-testid="load-more-btn"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner" aria-hidden="true"></i>
                Cargando…
              </>
            ) : (
              <>
                <i className="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
                Cargar órdenes anteriores
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
