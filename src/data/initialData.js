export const INITIAL_CAROUSEL_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
    title: "Rehabilitación Oral Completa de Zirconio",
    author: "Dra. Sofía Mendoza - Clínica Dental Esthetic",
    description:
      "Paciente de 45 años. Prótesis fija de 1Unit de arco completo sobre implantes con ajuste pasivo perfecto y textura natural.",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1200&q=80",
    title: "Corona Monolítica CAD/CAM E-Max",
    author: "Dr. Roberto Silva - Odontología Digital",
    description:
      "Corona en sector posterior (pieza 16) diseñada digitalmente y fresada con precisión micrométrica para una oclusión ideal.",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=1200&q=80",
    title: "Carillas de Disilicato de Litio Premium",
    author: "Dra. Carolina Ortega - Centro Odontológico Avanzado",
    description:
      "Transformación de sonrisa mediante 6 carillas ultrafinas de alta traslucidez y mapeo de color personalizado.",
  },
]

export const INITIAL_ORDERS = [
  {
    id: "ORD-9842",
    paciente: "María José Delgado",
    clinica: "Clínica Dental Esthetic",
    tipo: "Prótesis Fija",
    material: "Zirconio Monolítico",
    color: "A2 VITA",
    piezas: ["11", "21"],
    estado: "En Proceso",
    fecha: "2026-06-20",
  },
  {
    id: "ORD-9811",
    paciente: "Carlos Ernesto Gómez",
    clinica: "Clínica Dental Esthetic",
    tipo: "Prótesis Removible",
    material: "Flexible Definitivo",
    color: "A3 VITA",
    piezas: ["34", "35", "36"],
    estado: "Recibido",
    fecha: "2026-06-22",
  },
  {
    id: "ORD-9750",
    paciente: "Lucía Fernanda Reyes",
    clinica: "Clínica Dental Esthetic",
    tipo: "Ortodoncia / Alineadores",
    material: "Férula Essix (Retenedor)",
    color: "Transparente",
    piezas: ["Arcada Superior"],
    estado: "Completado",
    fecha: "2026-06-15",
  },
]
