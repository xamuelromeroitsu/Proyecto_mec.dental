export default function ServiceCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center text-xl mb-6">
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
