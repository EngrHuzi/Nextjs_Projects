import { authAPI } from '@/lib/auth'
import { verifyJWT } from '@/lib/jwt'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})();

// Mock fetch
global.fetch = jest.fn();

// Mock JWT verification
jest.mock('@/lib/jwt', () => ({
  verifyJWT: jest.fn(),
  signJWT: jest.fn(() => 'mock-jwt-token'),
  extractTokenFromHeader: jest.fn(),
}))

describe('Auth API', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('login', () => {
    it('should make a POST request to the login endpoint', async () => {
      // Mock successful response
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'USER' }
      const mockResponse = { success: true, user: mockUser, token: 'mock-token' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      // Call login
      const result = await authAPI.login({ email: 'test@example.com', password: 'password123' })

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })

      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'mock-token')

      // Verify result
      expect(result).toEqual(mockResponse)
    })

    it('should throw an error when login fails', async () => {
      // Mock failed response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      })

      // Call login and expect it to throw
      await expect(
        authAPI.login({ email: 'test@example.com', password: 'wrong-password' })
      ).rejects.toThrow('Invalid credentials')

      // Verify localStorage was not updated
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('should make a POST request to the register endpoint', async () => {
      // Mock successful response
      const mockUser = { id: '1', name: 'New User', email: 'new@example.com', role: 'USER' }
      const mockResponse = { success: true, user: mockUser, token: 'mock-token' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      // Call register
      const result = await authAPI.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      })

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
        }),
      })

      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'mock-token')

      // Verify result
      expect(result).toEqual(mockResponse)
    })

    it('should throw an error when registration fails', async () => {
      // Mock failed response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'User already exists' }),
      })

      // Call register and expect it to throw
      await expect(
        authAPI.register({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User already exists')

      // Verify localStorage was not updated
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should remove user and token from localStorage', async () => {
      // Setup localStorage with user and token
      localStorageMock.setItem('currentUser', JSON.stringify({ id: '1', name: 'Test User' }))
      localStorageMock.setItem('authToken', 'mock-token')

      // Mock successful response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      // Call logout
      await authAPI.logout()

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
      })

      // Verify localStorage items were removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken')
    })
  })

  describe('getCurrentUser', () => {
    it('should return user from localStorage if available', async () => {
      // Setup localStorage with user
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'USER' }
      localStorageMock.setItem('currentUser', JSON.stringify(mockUser))
      localStorageMock.setItem('authToken', 'mock-token')

      // Mock JWT verification
      ;(verifyJWT as jest.Mock).mockResolvedValueOnce({ sub: '1', exp: Date.now() / 1000 + 3600 })

      // Call getCurrentUser
      const user = await authAPI.getCurrentUser()

      // Verify result
      expect(user).toEqual(mockUser)

      // Verify fetch was not called (since user was in localStorage)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should fetch user from API if token is valid but user not in localStorage', async () => {
      // Setup localStorage with token only
      localStorageMock.setItem('authToken', 'mock-token')

      // Mock JWT verification
      ;(verifyJWT as jest.Mock).mockResolvedValueOnce({ sub: '1', exp: Date.now() / 1000 + 3600 })

      // Mock successful API response
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'USER' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })

      // Call getCurrentUser
      const user = await authAPI.getCurrentUser()

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: { 'Authorization': 'Bearer mock-token' },
      })

      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser))

      // Verify result
      expect(user).toEqual(mockUser)
    })

    it('should return null if no token is available', async () => {
      // Call getCurrentUser with empty localStorage
      const user = await authAPI.getCurrentUser()

      // Verify result is null
      expect(user).toBeNull()

      // Verify fetch was not called
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should return null if token is invalid', async () => {
      // Setup localStorage with token
      localStorageMock.setItem('authToken', 'invalid-token')

      // Mock JWT verification to throw
      ;(verifyJWT as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'))

      // Call getCurrentUser
      const user = await authAPI.getCurrentUser()

      // Verify result is null
      expect(user).toBeNull()

      // Verify localStorage items were removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken')

      // Verify fetch was not called
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})