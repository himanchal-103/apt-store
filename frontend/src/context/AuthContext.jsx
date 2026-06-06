import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    const res = await api.post('/accounts/auth/login/', { email, password })
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(async (onDone) => {
    try { await api.post('/accounts/auth/logout/') } catch (_) {}
    setUser(null)
    if (onDone) onDone()
  }, [])

  const register = useCallback(async (data) => {
    const res = await api.post('/accounts/auth/register/', data)
    return res.data
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
