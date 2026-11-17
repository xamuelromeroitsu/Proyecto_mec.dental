import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentSession, onAuthStateChange, signOut } from '../services/auth'
import { fetchOrders } from '../services/orders'

/**
 * SessionContext — estado global de sesión (capa app).
 * Centraliza: sesión persistida (Supabase), órdenes visibles por RLS y
 * las acciones de login/logout. Las vistas consumen vía `useSession()`.
 */
const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [authData, setAuthData] = useState(null)
  const [orders, setOrders] = useState([])
  const [restoring, setRestoring] = useState(true)

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await fetchOrders())
    } catch (err) {
      console.error('Error cargando órdenes:', err.message)
      setOrders([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getCurrentSession().then(async (session) => {
      if (cancelled) return
      if (session) {
        setAuthData(session)
        await loadOrders()
      }
      if (!cancelled) setRestoring(false)
    })
    const unsubscribe = onAuthStateChange((_event, session) => {
      if (!session && !cancelled) {
        setAuthData(null)
        setOrders([])
      }
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [loadOrders])

  const logIn = useCallback(async (data) => {
    setAuthData(data)
    try {
      setOrders(await fetchOrders())
    } catch (err) {
      console.error('Error cargando órdenes:', err.message)
      setOrders([])
    }
  }, [])

  const logOut = useCallback(async () => {
    await signOut()
    setAuthData(null)
    setOrders([])
  }, [])

  const addOrder = useCallback((newOrder) => {
    setOrders((prev) => [newOrder, ...prev])
  }, [])

  const value = useMemo(
    () => ({ authData, orders, restoring, logIn, logOut, addOrder }),
    [authData, orders, restoring, logIn, logOut, addOrder]
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
