export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Dra. Sofía Mendoza",
      clinic: "Clínica Dental Esthetic",
      text: "Excelente calidad en las prótesis fijas de zirconio. Los ajustes son precisos y el acabado estético es impecable. Mis pacientes quedan muy satisfechos.",
      rating: 5,
    },
    {
      id: 2,
      name: "Dr. Roberto Silva",
      clinic: "Odontología Digital",
      text: "El flujo digital CAD/CAM de NovaDent nos ahorra tiempo y garantiza resultados consistentes. Recepción de archivos STL rápida y entrega puntual.",
      rating: 5,
    },
    {
      id: 3,
      name: "Dra. Carolina Ortega",
      clinic: "Centro Odontológico Avanzado",
      text: "Las carillas de disilicato de litio que nos entregan tienen una translucidez y coloración natural espectacular. Recomiendo totalmente su servicio.",
      rating: 5,
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-sky-500 font-bold uppercase text-xs tracking-wider">Testimonios</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Lo que dicen nuestros colegas</h2>
          <p className="text-slate-500 mt-2">Odontólogos que confían en NovaDent LAB para sus casos clínicos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <i key={i} className="fa-solid fa-star text-amber-400 text-sm"></i>
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.clinic}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
