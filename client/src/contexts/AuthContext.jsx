/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { clearStoredToken, getStoredToken, setStoredToken } from '../lib/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(null)
  const [isHydrating, setIsHydrating] = useState(Boolean(getStoredToken()))

  function clearSession() {
    clearStoredToken()
    setToken(null)
    setUser(null)
  }

  async function hydrateWithToken(nextToken) {
    const profile = await apiRequest('/auth/me', { token: nextToken })
    setStoredToken(nextToken)
    setToken(nextToken)
    setUser(profile)
    return profile
  }

  async function login(credentials) {
    const nextToken = await apiRequest('/auth/login', {
      body: credentials,
      method: 'POST',
    })

    return hydrateWithToken(nextToken)
  }

  async function register(credentials) {
    await apiRequest('/auth/register', {
      body: {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
      },
      method: 'POST',
    })

    return login({
      password: credentials.password,
      username: credentials.username,
    })
  }

  async function logout() {
    try {
      if (token) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          token,
        })
      }
    } catch {
      // Clear local session even if the backend token is already invalid.
    } finally {
      clearSession()
    }
  }

  useEffect(() => {
    function handleUnauthorized() {
      clearSession()
    }

    window.addEventListener('app:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('app:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    let isActive = true

    async function restoreSession() {
      if (!token) {
        setIsHydrating(false)
        return
      }

      setIsHydrating(true)

      try {
        const profile = await apiRequest('/auth/me', { token })
        if (!isActive) {
          return
        }

        setUser(profile)
      } catch {
        if (!isActive) {
          return
        }

        clearSession()
      } finally {
        if (isActive) {
          setIsHydrating(false)
        }
      }
    }

    restoreSession()

    return () => {
      isActive = false
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        clearSession,
        isAuthenticated: Boolean(token && user),
        isHydrating,
        login,
        logout,
        register,
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
