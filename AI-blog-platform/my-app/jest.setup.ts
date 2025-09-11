// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock the next/router
jest.mock('next/router', () => require('next-router-mock'))

// Mock localStorage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  })
}

// Suppress console errors during tests
console.error = jest.fn()

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})