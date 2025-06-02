// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => require('next-router-mock'))

// Mock next/navigation
const useRouter = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter,
  usePathname: jest.fn(),
}))

// Reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
}) 