import './ServiceCard.css'

export default function ServiceCard({ icon, title, desc }) {
  return (
    <div className="service-card">
      <div>
        <div className="service-card-icon">
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <h3 className="service-card-title">{title}</h3>
        <p className="service-card-desc">{desc}</p>
      </div>
    </div>
  )
}
