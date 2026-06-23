import { useState } from 'react'

export default function InteractiveCarousel({ images }) {
  const [selectedCase, setSelectedCase] = useState(null)
  const speed = 25
  const direction = 'left'

  if (images.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
        <i className="fa-solid fa-images text-4xl mb-3 text-slate-300"></i>
        <p className="font-semibold">No hay imágenes en la galería clínica en este momento.</p>
      </div>
    )
  }

  const duplicatedImages = [...images, ...images, ...images]

  return (
    <div className="relative space-y-6 w-full overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-33.3333%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scrollLeft var(--scroll-speed, 25s) linear infinite;
        }
        .animate-scroll-right {
          animation: scrollRight var(--scroll-speed, 25s) linear infinite;
        }
      `}} />

      <div className="relative overflow-hidden w-full py-4 bg-slate-900 rounded-3xl shadow-inner border border-slate-800">
        <div className="absolute top-4 left-4 z-20 bg-slate-950/80 text-sky-400 font-bold text-[10px] uppercase px-3 py-1 rounded-full border border-sky-500/20 backdrop-blur-sm tracking-widest flex items-center gap-1.5 pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          En Vivo • Desplazamiento Continuo • Clic para ver detalles
        </div>

        <div
          className={`flex gap-6 w-max ${direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'}`}
          style={{ '--scroll-speed': `${speed}s` }}
        >
          {duplicatedImages.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
              onClick={() => setSelectedCase(image)}
              className="w-80 md:w-96 flex-shrink-0 relative group cursor-pointer bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl transition-all duration-300 hover:border-sky-500 hover:shadow-sky-950/20 hover:scale-[1.02]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-sky-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <i className="fa-solid fa-signature"></i> {image.author.split(' - ')[0]}
                </div>
              </div>

              <div className="p-5 text-white space-y-2">
                <h4 className="text-base font-bold text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-1">{image.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{image.description}</p>
                <div className="pt-2 flex justify-between items-center border-t border-slate-800/80 text-[11px] text-sky-400 font-semibold">
                  <span>Ficha Técnica Disponible</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ver Caso <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col md:flex-row transform transition-all animate-scale-up max-h-[90vh] md:max-h-[80vh]">

            <div className="md:w-1/2 bg-slate-900 relative flex items-center justify-center overflow-hidden h-64 md:h-auto min-h-[300px]">
              <img
                src={selectedCase.url}
                alt={selectedCase.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/70 text-white p-3 rounded-xl border border-white/10 backdrop-blur-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-lg shrink-0">
                  <i className="fa-solid fa-microscope"></i>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">Inspección de Laboratorio</p>
                  <p className="text-xs text-slate-200 font-semibold truncate">Estructura calibrada y ajuste pasivo micrométrico.</p>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6 text-left">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="inline-flex bg-sky-50 text-sky-600 border border-sky-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                      <i className="fa-solid fa-signature mr-1.5"></i> {selectedCase.author.split(' - ')[1]}
                    </span>
                    <h3 className="text-xl md:text-2xl font-extrabold text-slate-950">{selectedCase.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
                  >
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción del Trabajo</h5>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedCase.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Clínico Remitente</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">{selectedCase.author.split(' - ')[0]}</p>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tecnología de Diseño</p>
                    <p className="text-xs font-bold text-sky-600 mt-1"><i className="fa-solid fa-laptop-medical mr-1"></i> Flujo CAD/CAM</p>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Ajuste Oclusal</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">Óptimo (Cero Retoques)</p>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Material de Confección</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">E-Max / Zirconio Premium</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <i className="fa-solid fa-shield-check text-green-500 mr-1.5"></i> Garantía de Estructura NovaDent
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="bg-sky-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-sky-600 transition-colors shadow-md shadow-sky-100"
                >
                  Entendido, Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
