/* eslint-disable react-refresh/only-export-components */
import { createContext, startTransition, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated, isHydrating } = useAuth()
  const [count, setCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  async function refreshCartCount() {
    if (!isAuthenticated) {
      startTransition(() => setCount(0))
      return 0
    }

    setIsSyncing(true)

    try {
      const lines = await apiRequest('/carts')
      const nextCount = lines.reduce((total, line) => total + Number(line.quantity || 0), 0)
      startTransition(() => setCount(nextCount))
      return nextCount
    } catch {
      startTransition(() => setCount(0))
      return 0
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    if (isHydrating) {
      return
    }

    let isActive = true

    async function sync() {
      if (!isAuthenticated) {
        startTransition(() => setCount(0))
        return
      }

      setIsSyncing(true)

      try {
        const lines = await apiRequest('/carts')
        if (!isActive) {
          return
        }
        const nextCount = lines.reduce((total, line) => total + Number(line.quantity || 0), 0)
        startTransition(() => setCount(nextCount))
      } catch {
        if (isActive) {
          startTransition(() => setCount(0))
        }
      } finally {
        if (isActive) {
          setIsSyncing(false)
        }
      }
    }

    sync()

    return () => {
      isActive = false
    }
  }, [isAuthenticated, isHydrating])

  return (
    <CartContext.Provider
      value={{
        count,
        isSyncing,
        refreshCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
