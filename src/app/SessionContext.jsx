import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentSession, onAuthStateChange, signOut } from '../services/auth'
import { fetchOrders, fetchOrderStats } from '../services/orders'
import { PAGE_SIZE } from '../lib/pagination'

/**
 * =========================================================================
 * SessionContext — estado global de sesión + feed de órdenes (capa app)
 * =========================================================================
 *
 * QUÉ HACE: centraliza sesión persistida (Supabase Auth) y el feed de
 * órdenes como MÁQUINA DE ESTADOS paginada. Las vistas consumen vía
 * `useSession()` — ninguna vista llama a Supabase directamente.
 *
 * POR QUÉ: el feed ya no es un array plano sino paginado (ver
 * lib/pagination). Un array simple no puede expresar "¿hay más?", así que
 * el contexto expone la máquina completa:
 *
 *   orders     → página(s) ya acumuladas en pantalla
 *   hasMore    → ¿existe página siguiente? (controla botón "Cargar más")
 *   loading    → petición en vuelo (evita duplicar clicks)
 *   loadMore() → pide la SIGUIENTE página y la CONCATENA
 *   refresh()  → reinicia a la primera página (cambio de chip, login,
 *                orden nueva). NO recarga todo el histórico: solo page 1.
 *   stats      → contadores del perfil ({total, enCurso, completadas});
 *                vienen de COUNTs server-side, no de orders.length —
 *                con paginación, "número de órdenes" ≠ "filas en pantalla".
 */
const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [authData, setAuthData] = useState(null)
  const [orders, setOrders] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, enCurso: 0, completadas: 0 })
  const [restoring, setRestoring] = useState(true)

  // Identifica la petición en vuelo: si el usuario cambia de chip mientras
  // vuela una carga, la respuesta vieja NO debe pintarse (condición de carrera).
  const requestIdRef = useRef(0)

  /** Carga (o recarga) la PRIMERA página para el chip dado. */
  const loadPage = useCallback(async (grupo) => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const page = await fetchOrders({ grupo, cursor: null, limit: PAGE_SIZE })
      // Solo aplica si sigue siendo la petición vigente
      if (requestId !== requestIdRef.current) return
      setOrders(page.orders)
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (err) {
      console.error('Error cargando órdenes:', err.message)
      if (requestId === requestIdRef.current) {
        setOrders([])
        setHasMore(false)
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  /** Refresca los contadores del perfil (COUNTs baratos). */
  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchOrderStats())
    } catch (err) {
      console.error('Error cargando estadísticas:', err.message)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getCurrentSession().then(async (session) => {
      if (cancelled) return
      if (session) {
        setAuthData(session)
        await loadPage('all')
        loadStats()
      }
      if (!cancelled) setRestoring(false)
    })
    const unsubscribe = onAuthStateChange((_event, session) => {
      if (!session && !cancelled) {
        setAuthData(null)
        setOrders([])
        setHasMore(false)
        setStats({ total: 0, enCurso: 0, completadas: 0 })
      }
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [loadPage, loadStats])

  /** Login: marca sesión y pide la primera página + stats. */
  const logIn = useCallback(async (data) => {
    setAuthData(data)
    await loadPage('all')
    loadStats()
  }, [loadPage, loadStats])

  const logOut = useCallback(async () => {
    await signOut()
    setAuthData(null)
    setOrders([])
    setHasMore(false)
    setStats({ total: 0, enCurso: 0, completadas: 0 })
  }, [])

  /**
   * "Cargar más": pide la página siguiente con el cursor guardado y la
   * CONCATENA a las ya visibles. Si el chip cambió en medio, el guard del
   * requestId descarta la respuesta vieja.
   */
  const loadMore = useCallback(async () => {
    if (!cursor || loading) return // sin cursor no hay página siguiente
    const requestId = requestIdRef.current
    setLoading(true)
    try {
      const grupo = activeGroupRef.current
      const page = await fetchOrders({ grupo, cursor, limit: PAGE_SIZE })
      if (requestId !== requestIdRef.current) return
      setOrders((prev) => [...prev, ...page.orders])
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (err) {
      console.error('Error cargando más órdenes:', err.message)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [cursor, loading])

  // Chip activo en un ref: loadMore siempre lee el valor vigente sin
  // re-crearse (y sin cerrarse sobre un grupo viejo).
  const activeGroupRef = useRef('all')

  /** Cambio de chip: resetea a página 1 del nuevo grupo (server-side). */
  const setGroup = useCallback((grupo) => {
    activeGroupRef.current = grupo
    loadPage(grupo)
  }, [loadPage])

  /**
   * Orden recién creada: se INSERTA EN CABEZA del feed (las nuevas son las
   * más recientes) y se refrescan los stats. Así NO hay que re-descargar
   * la página 1 desde el servidor.
   */
  const addOrder = useCallback((newOrder) => {
    setOrders((prev) => [newOrder, ...prev])
    setStats((prev) => ({ ...prev, total: prev.total + 1, enCurso: prev.enCurso + 1 }))
  }, [])

  const value = useMemo(
    () => ({ authData, orders, hasMore, loading, stats, restoring, logIn, logOut, loadMore, setGroup, addOrder }),
    [authData, orders, hasMore, loading, stats, restoring, logIn, logOut, loadMore, setGroup, addOrder]
  )

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>')
  }
  return context
}
