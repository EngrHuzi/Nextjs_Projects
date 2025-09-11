import { logger } from './logger'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

// API-backed auth implementation
export const authAPI = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        logger.warn('Login failed', { email, error: data.error })
        return { success: false, message: data.error || 'Login failed' }
      }
      
      // Store the JWT token
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      
      logger.info('User logged in successfully', { userId: data.user.id })
      return { success: true, user: data.user as User, token: data.token }
    } catch (error) {
      logger.error('Login error', { error })
      return { success: false, message: 'An unexpected error occurred' }
    }
  },

  async register(userData: Omit<RegisterFormData, 'confirmPassword'>): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const data = await res.json()
    if (!res.ok) {
      logger.warn('Registration failed', { email: userData.email, error: data.error })
      return { success: false, message: data.error || 'Registration failed' }
    }
    
    // Store the JWT token
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }
    
    logger.info('User registered successfully', { userId: data.user.id })
    return { success: true, user: data.user as User, token: data.token }
  } catch (error) {
    logger.error('Registration error', { error })
    return { success: false, message: 'An unexpected error occurred' }
  }
},

  async logout(): Promise<void> {
    try {
      // Call logout API endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
    } catch (error) {
      logger.warn('Logout API call failed', { error })
      // Continue with local logout even if API call fails
    } finally {
      // Remove token and user data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('currentUser')
      logger.info('User logged out')
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return null
      }
      
      // Try to get user from localStorage first for faster loading
      const cachedUser = localStorage.getItem('currentUser')
      if (cachedUser) {
        return JSON.parse(cachedUser)
      }
      
      // If no cached user, fetch from API
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!res.ok) {
        // Token might be invalid or expired
        localStorage.removeItem('auth_token')
        localStorage.removeItem('currentUser')
        return null
      }
      
      const data = await res.json()
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        return data.user
      }
      
      return null
    } catch (error) {
      logger.error('Error getting current user', { error })
      return null
    }
  }
}

