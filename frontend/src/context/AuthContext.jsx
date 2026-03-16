import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('opale_token')
    const savedUser = localStorage.getItem('opale_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {}
    }
    // Verify token is still valid
    if (token) {
      authApi.me()
        .then(res => {
          setUser(res.data.user)
          localStorage.setItem('opale_user', JSON.stringify(res.data.user))
        })
        .catch(() => {
          localStorage.removeItem('opale_token')
          localStorage.removeItem('opale_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    localStorage.setItem('opale_token', res.data.token)
    localStorage.setItem('opale_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const loginWithGoogle = async (credential) => {
    const res = await authApi.googleLogin({ credential })
    localStorage.setItem('opale_token', res.data.token)
    localStorage.setItem('opale_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (email, password, full_name) => {
    const res = await authApi.register({ email, password, full_name })
    localStorage.setItem('opale_token', res.data.token)
    localStorage.setItem('opale_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const logout = () => {
    localStorage.removeItem('opale_token')
    localStorage.removeItem('opale_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
