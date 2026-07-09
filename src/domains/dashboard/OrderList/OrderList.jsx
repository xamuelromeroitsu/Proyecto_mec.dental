import './OrderList.css'

export default function OrderList({ orders }) {
  return (
    <div className="order-list">
      <div className="order-list-header">
        <span className="order-list-title">Trabajos Registrados</span>
        <span className="order-list-count">{orders.length} Órdenes Activas</span>
      </div>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Paciente</th>
              <th>Tipo de Prótesis</th>
              <th>Material / Guía VITA</th>
              <th>Dientes</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id}>
                <td className="order-id">{ord.id}</td>
                <td>
                  <p className="order-patient">{ord.paciente}</p>
                  <p className="order-clinic">{ord.clinica}</p>
                </td>
                <td className="order-type">{ord.tipo}</td>
                <td>
                  <p className="order-material">{ord.material}</p>
                  <p className="order-color">{ord.color}</p>
                </td>
                <td>
                  <div className="order-teeth">
                    {ord.piezas.map((tooth, idx) => (
                      <span key={idx} className="order-tooth-tag">{tooth}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`order-status ${
                    ord.estado === 'Completado' ? 'order-status--completed' :
                    ord.estado === 'En Proceso' ? 'order-status--in-progress' :
                    'order-status--received'
                  }`}>
                    <i className={`fa-solid ${
                      ord.estado === 'Completado' ? 'fa-circle-check' :
                      ord.estado === 'En Proceso' ? 'fa-spinner' :
                      'fa-inbox'
                    }`}></i>
                    {ord.estado}
                  </span>
                </td>
                <td className="order-date">{ord.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
