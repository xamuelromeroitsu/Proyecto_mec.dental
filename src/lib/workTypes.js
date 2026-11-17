/**
 * Catálogo de tipos de trabajo (capa lib — fuente única de verdad).
 *
 * Consumido por 3 capas:
 *   - `Services` (landing "lo que se hace") → iconos + descripciones
 *   - `DashboardView` (chips de búsqueda)   → grupos de filtro
 *   - `NewOrderForm` (altas de órdenes)     → selects tipo/material/color
 *
 * La BD guarda `tipo_trabajo` como TEXT libre, así que las claves aquí son
 * solo lógicas y las etiquetas (`label`) son lo que se persiste.
 */

/** Guías de color/acabado por tipo (valores de la columna color_vita). */
export const COLOR_GUIDES = {
  vita: ['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'D2', 'D3'],
  metal: ['Oro Amarillo', 'Oro Blanco', 'Oro Rosa', 'Plata', 'Platino', 'N/A'],
  na: ['Transparente', 'N/A'],
}

export const WORK_TYPES = [
  {
    key: 'fija',
    label: 'Prótesis Fija',
    icon: 'fa-tooth',
    filterGroup: 'fija',
    colorGuide: 'vita',
    materials: [
      'Zirconio Monolítico',
      'Zirconio Translúcido',
      'Disilicato de Litio (E-Max)',
      'Metal-Porcelana',
      'Provisional PMMA',
    ],
  },
  {
    key: 'carillas',
    label: 'Carillas',
    icon: 'fa-face-smile',
    filterGroup: 'fija',
    colorGuide: 'vita',
    materials: [
      'Porcelana Feldespática',
      'Disilicato de Litio',
      'Zirconio Translúcido',
      'Resina Compuesta (Composite)',
    ],
  },
  {
    key: 'grillz',
    label: 'Grillz',
    icon: 'fa-gem',
    filterGroup: 'grillz',
    colorGuide: 'metal',
    // Fundas estéticas removibles: encerado y colado tradicional con
    // metales preciosos; personalizables con gemas ranqueadas vía indicaciones.
    materials: [
      'Oro Amarillo 10k',
      'Oro Amarillo 14k',
      'Oro Amarillo 18k',
      'Oro Blanco 14k',
      'Oro Rosa 14k',
      'Plata Esterlina 925',
      'Platino',
      'Cromo-Cobalto Chapado en Oro/Rodio',
    ],
  },
  {
    key: 'total',
    label: 'Prótesis Total',
    icon: 'fa-teeth-open',
    filterGroup: 'removible',
    colorGuide: 'vita',
    materials: [
      'PMMA Termopolimerizable + Dientes de Acrílico',
      'PMMA Termopolimerizable + Dientes de Porcelana',
    ],
  },
  {
    key: 'parcial',
    label: 'Prótesis Parcial (Acrílico)',
    icon: 'fa-teeth-open',
    filterGroup: 'removible',
    colorGuide: 'vita',
    materials: [
      'PMMA + Ganchos de Acero Inoxidable',
      'Esquelético (Cromo-Cobalto)',
    ],
  },
  {
    key: 'flexible',
    label: 'Prótesis Flexible',
    icon: 'fa-feather',
    filterGroup: 'removible',
    colorGuide: 'vita',
    materials: [
      'Poliamida Inyectada',
      'Nylon Termoplástico (Valplast)',
    ],
  },
  {
    key: 'bruxismo',
    label: 'Férula de Bruxismo',
    icon: 'fa-shield-halved',
    filterGroup: 'proteccion',
    colorGuide: 'na',
    materials: ['PMMA Rígida'],
  },
  {
    key: 'hawley',
    label: 'Retenedor Hawley',
    icon: 'fa-sliders',
    filterGroup: 'ortodoncia',
    colorGuide: 'vita',
    materials: ['Acrílico Autopolimerizable + Alambre de Acero Inoxidable'],
  },
  {
    key: 'alineadores',
    label: 'Alineador Invisible',
    icon: 'fa-eye-slash',
    filterGroup: 'ortodoncia',
    colorGuide: 'na',
    materials: ['Lámina Termoplástica Transparente'],
  },
  {
    key: 'deportivo',
    label: 'Protector Bucal Deportivo',
    icon: 'fa-medal',
    filterGroup: 'proteccion',
    colorGuide: 'na',
    materials: ['Etileno-Vinil-Acetato (EVA) Blando'],
  },
  {
    key: 'blanqueamiento',
    label: 'Férula de Blanqueamiento',
    icon: 'fa-wand-magic-sparkles',
    filterGroup: 'proteccion',
    colorGuide: 'na',
    materials: ['Lámina Termoplástica Blanda y Fina'],
  },
]

/** Etiquetas históricas guardadas en órdenes previas al catálogo. */
const LEGACY_GROUP = {
  'Prótesis Fija': 'fija',
  'Prótesis Removible': 'removible',
  'Ortodoncia / Alineadores': 'ortodoncia',
}

/** Tipo del catálogo por etiqueta (con fallback a Prótesis Fija). */
export function getWorkType(tipoLabel) {
  return WORK_TYPES.find((t) => t.label === tipoLabel) || WORK_TYPES[0]
}

/** Guía de color/acabado de un tipo de trabajo. */
export function colorsFor(tipoLabel) {
  return COLOR_GUIDES[getWorkType(tipoLabel).colorGuide] || COLOR_GUIDES.na
}

/** Color/acabado por defecto: A2 en guía VITA; primera opción en metal/NA. */
export function defaultColorFor(tipoLabel) {
  const guideKey = getWorkType(tipoLabel).colorGuide
  const colors = COLOR_GUIDES[guideKey] || COLOR_GUIDES.na
  if (guideKey === 'vita' && colors.includes('A2')) return 'A2'
  return colors[0]
}

/**
 * Grupo de filtro al que pertenece una orden (por su etiqueta) — usado por
 * los chips del dashboard. Soporta etiquetas del catálogo y las legadas.
 * (NO usa getWorkType: su fallback a Prótesis Fija corrompería las legadas.)
 */
export function filterGroupOf(tipoLabel) {
  const entry = WORK_TYPES.find((t) => t.label === tipoLabel)
  if (entry) return entry.filterGroup
  return LEGACY_GROUP[tipoLabel] || null
}
