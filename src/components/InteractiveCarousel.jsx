import { useState } from 'react'

export default function InteractiveCarousel({ images }) {
  const [selectedCase, setSelectedCase] = useState(null)
  const speed = 45
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
        <div
          className={`flex gap-6 w-max ${direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'}`}
          style={{ '--scroll-speed': `${speed}s` }}
        >
          {duplicatedImages.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
              onClick={() => setSelectedCase(image)}
              className="w-64 sm:w-80 md:w-96 flex-shrink-0 relative group cursor-pointer rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCase && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setSelectedCase(null)}>
          <button
            onClick={() => setSelectedCase(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors z-10"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          <img
            src={selectedCase.url}
            alt={selectedCase.title}
            className="max-w-full max-h-full object-contain p-4"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
