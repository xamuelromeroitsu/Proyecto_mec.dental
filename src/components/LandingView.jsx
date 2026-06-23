import InteractiveCarousel from './InteractiveCarousel'
import ServiceCard from './ServiceCard'

export default function LandingView({ carouselImages, onNavigateLogin }) {
  return (
    <div>
      <section id="inicio" className="relative pt-8 pb-16 md:pt-24 md:pb-32 bg-gradient-to-b from-sky-50 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <div className="inline-flex bg-white text-sky-500 font-semibold px-4 py-1.5 rounded-full shadow-sm text-sm border border-sky-100 items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles"></i> Odontología Digital Avanzada
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
              Precisión digital en cada <span className="text-sky-500">Prótesis</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto md:mx-0 leading-relaxed">
              Diseñamos el futuro de la mecánica dental. Aliados estratégicos de clínicas exigentes mediante tecnología CAD/CAM de máxima exactitud clínica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <button onClick={onNavigateLogin} className="bg-sky-500 text-white px-8 py-4 rounded-full font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2">
                <i className="fa-solid fa-laptop-medical"></i> Ingresar al Portal Privado
              </button>
              <a href="#casos" className="bg-white text-sky-500 border border-sky-200 px-8 py-4 rounded-full font-bold hover:bg-sky-50 transition-all shadow-sm flex items-center justify-center gap-2">
                <i className="fa-solid fa-images"></i> Ver Casos de Clientes
              </a>
            </div>
          </div>
          <div className="md:w-1/2 relative flex justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white w-full max-w-lg aspect-[4/3] bg-sky-100">
              <img
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Laboratorio Tecnológico Dental"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="casos" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="text-sky-500 font-bold uppercase text-xs tracking-wider">Casos de Éxito Reales</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Galería de Trabajos Enviados</h2>
              <p className="text-slate-500 mt-2 max-w-2xl">La precisión oclusal y la alta estética se unen en boca de los pacientes.</p>
            </div>
          </div>
          <InteractiveCarousel images={carouselImages} />
        </div>
      </section>

      <section id="servicios" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sky-500 font-bold uppercase text-xs tracking-wider">Especialidades de Manufactura</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Soluciones Protésicas Integrales</h2>
            <p className="text-slate-500 mt-2">Combinamos destreza artesanal y automatización digital de punta para satisfacer las necesidades de su clínica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon="fa-teeth"
              title="Prótesis Fija de Alta Estética"
              desc="Coronas, puentes y carillas premium confeccionadas en Zirconio, Disilicato de Litio (E-Max) y cerámicas feldespáticas con alta traslucidez."
            />
            <ServiceCard
              icon="fa-teeth-open"
              title="Prótesis Removible y Flexibles"
              desc="Estructuras de acrílico termocurado tradicionales, parciales metálicos (cromo-cobalto) y prótesis flexibles de nylon biocompatible de alta elasticidad."
            />
            <ServiceCard
              icon="fa-laptop-medical"
              title="Flujo Digital Completo CAD/CAM"
              desc="Recepción directa de archivos STL de escáner intraoral. Diseño digital (Exocad) e impresión 3D de alta precisión para modelos quirúrgicos."
            />
            <ServiceCard
              icon="fa-bezier-curve"
              title="Aparatología de Ortodoncia"
              desc="Placas de Hawley, expansores palatinos rápidos, mantenedores de espacio y férulas termoconformadas Essix de alta durabilidad."
            />
            <ServiceCard
              icon="fa-screws"
              title="Rehabilitación sobre Implantes"
              desc="Sistemas atornillados directos a implante, pilares personalizados de titanio/zirconio y barras híbridas fresadas con precisión micrométrica."
            />
            <ServiceCard
              icon="fa-truck-fast"
              title="Servicio de Logística Express"
              desc="Recogida y entrega de impresiones físicas directamente en su consultorio con tiempos de entrega de urgencia garantizados."
            />
          </div>
        </div>
      </section>

      <section id="nosotros" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-3xl p-8 md:p-16 text-white shadow-xl shadow-sky-100 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="lg:w-2/3 space-y-6 text-left">
              <h3 className="text-3xl font-extrabold">¿Por qué NovaDent es el mejor aliado clínico?</h3>
              <p className="text-sky-50 text-lg leading-relaxed">
                Ofrecemos una experiencia integral de manufactura. No somos solo un proveedor; trabajamos codo a codo con cada odontólogo para garantizar cero repeticiones de coronas y máxima comodidad para el paciente.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full"><i className="fa-solid fa-shield-halved text-white"></i></div>
                  <span className="font-semibold text-sm">Materiales Biocompatibles Certificados</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full"><i className="fa-solid fa-microscope text-white"></i></div>
                  <span className="font-semibold text-sm">Inspección de Ajuste Bajo Microscopio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full"><i className="fa-solid fa-clock text-white"></i></div>
                  <span className="font-semibold text-sm">Puntualidad en Logística Clínicas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full"><i className="fa-solid fa-user-check text-white"></i></div>
                  <span className="font-semibold text-sm">Atención y Asesoría Técnica Directa</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3 flex justify-center w-full">
              <button onClick={onNavigateLogin} className="bg-white text-sky-600 px-8 py-5 rounded-full font-bold text-lg hover:bg-sky-50 transition-all shadow-lg w-full lg:w-auto text-center flex items-center justify-center gap-2">
                <i className="fa-solid fa-sign-in-alt"></i> Acceder al Portal Privado
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
