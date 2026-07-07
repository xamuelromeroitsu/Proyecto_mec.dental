import { useState } from 'react'

export default function InteractiveCarousel({ images }) {
  const [selectedCase, setSelectedCase] = useState(null)
  const display = images.slice(0, 4)

  if (images.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
        <i className="fa-solid fa-images text-4xl mb-3 text-slate-300"></i>
        <p className="font-semibold">No hay imágenes en la galería clínica en este momento.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full flex justify-center items-center py-16 bg-gradient-to-b from-slate-50/50 to-white">
      <style>{`
        .stack-container {
          position: relative;
          width: 280px;
          height: 380px;
        }
        .stack-card {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 45px rgba(0,0,0,0.25), 0 5px 15px rgba(0,0,0,0.1);
          cursor: pointer;
          animation: stackSpin 10s infinite ease-in-out;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .stack-card:hover {
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }
        .stack-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .stack-card .glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5), transparent 40%);
        }
        .s0 {
          animation-delay: 0s;
          z-index: 10;
          filter: brightness(1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.35), 0 0 40px rgba(56,189,248,0.15);
        }
        .s1 { animation-delay: 2.5s; z-index: 9; filter: brightness(0.85); }
        .s2 { animation-delay: 5s; z-index: 8; filter: brightness(0.7); }
        .s3 { animation-delay: 7.5s; z-index: 7; filter: brightness(0.6); }

        @keyframes stackSpin {
          0%, 15% { transform: translateX(0) scale(1) rotate(0deg); z-index: 10; filter: brightness(1); box-shadow: 0 20px 60px rgba(0,0,0,0.35), 0 0 40px rgba(56,189,248,0.15); }
          25%, 40% { transform: translateX(-140px) scale(0.85) rotate(-8deg); z-index: 5; filter: brightness(0.85); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
          50%, 65% { transform: translateX(0) scale(0.7) rotate(0deg); z-index: 1; filter: brightness(0.6); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
          75%, 90% { transform: translateX(140px) scale(0.85) rotate(8deg); z-index: 5; filter: brightness(0.85); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
          100% { transform: translateX(0) scale(1) rotate(0deg); z-index: 10; filter: brightness(1); box-shadow: 0 20px 60px rgba(0,0,0,0.35), 0 0 40px rgba(56,189,248,0.15); }
        }

        @media (max-width: 640px) {
          .stack-container { width: 200px; height: 280px; }
          @keyframes stackSpin {
            0%, 15% { transform: translateX(0) scale(1) rotate(0deg); z-index: 10; filter: brightness(1); }
            25%, 40% { transform: translateX(-90px) scale(0.85) rotate(-6deg); z-index: 5; filter: brightness(0.85); }
            50%, 65% { transform: translateX(0) scale(0.7) rotate(0deg); z-index: 1; filter: brightness(0.6); }
            75%, 90% { transform: translateX(90px) scale(0.85) rotate(6deg); z-index: 5; filter: brightness(0.85); }
            100% { transform: translateX(0) scale(1) rotate(0deg); z-index: 10; filter: brightness(1); }
          }
        }
      `}</style>

      <div className="stack-container">
        {display.map((image, i) => (
          <div
            key={image.id}
            className={`stack-card s${i}`}
            onClick={() => setSelectedCase(image)}
          >
            <img src={image.url} alt={image.title} />
            <div className="glow"></div>
          </div>
        ))}
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
