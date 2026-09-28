# ADR 003: Hooks Pattern — Lógica de Estado en Custom Hooks

**Fecha:** 2026-09-28
**Estado:** Aceptado
**Contexto:** La lógica de estado vive dentro de componentes (`NewOrderForm` 239 líneas, `DashboardView` maneja orders + views). Necesitamos separar UI de lógica para testabilidad y reutilización.

## Decisión
Extraer toda la lógica de estado y efectos a **custom hooks** en `domains/<dominio>/hooks/`:

| Hook | Responsabilidad |
|------|-----------------|
| `useAuth` | user, token, login(), logout(), isAuthenticated |
| `useOrders` | orders[], loading, error, createOrder(), updateStatus(), filter() |
| `useNewOrderForm` | formState, validation, file handling, submit() |
| `useOdontograma` | selectedTeeth[], toggleTooth(), clear() |
| `useQuotes` | calculateQuote(), materials[] (Fase 1) |

Los componentes se vuelven **presentacionales** (reciben props, llaman handlers).

## Alternativas Consideradas

| Opción | Pros | Contras |
|--------|------|---------|
| **Custom hooks** (elegido) | Reutilizable, testeable aislado, colocation con dominio | Requiere disciplina |
| **Estado en componente + props drilling** | Simple | No escala, prop drilling, difícil testear |
| **React Context + useReducer** | Estado global, devtools | Overkill para MVP, boilerplate |
| **Zustand / Jotai / Redux** | Poderoso, devtools | Dependencia extra, curva aprendizaje |

## Justificación
- **Colocation**: Hook al lado del dominio que sirve (`domains/dashboard/hooks/useOrders.js`)
- **Testabilidad**: Hook = función pura → test unitario rápido sin RTL
- **Reutilización**: `useOdontograma` usable en `NewOrderForm` y futuro `OrderDetail`
- **Migración gradual**: Se puede extraer hook a hook sin reescribir todo

## Convenciones
```js
// hooks/useOrders.js
export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createOrder = async (data) => { ... }
  const updateStatus = async (id, status) => { ... }

  return { orders, loading, error, createOrder, updateStatus }
}
```

- **Nombrado**: `use` + dominio + acción/entidad (`useNewOrderForm`, no `useForm`)
- **Retorno**: Objeto con estado + acciones (no array `[state, setState]`)
- **Efectos**: `useEffect` dentro del hook, no en componente
- **Dependencias**: `services/*` importados dentro del hook (tree-shaking)

## Consecuencias
- ✅ Componentes < 100 líneas, solo JSX
- ✅ Tests de hooks = tests unitarios rápidos (sin render)
- ✅ Lógica reutilizable en Storybook, tests, otros componentes
- ⚠️ Requiere ruleta: "¿esto es UI o lógica?" → si lógica, va al hook
- ⚠️ Evitar hooks que llaman a hooks que llaman a hooks (profundidad ≤ 2)

## Referencias
- [Component Structure Guide](../03-guias/component-structure.md)
- [Testing Guide](../03-guias/testing-guide.md#testear-hooks-aislados)
- [Implementation Plan - Fase 1](../04-especificaciones/05-implementation-plan.md#fase-1-refactor-core--motor-cotización)