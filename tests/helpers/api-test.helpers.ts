import { vi } from 'vitest'

/**
 * Helper functions for API endpoint testing
 */

/**
 * Create a mock H3 event object for testing API endpoints
 */
export const createMockEvent = (options: {
  query?: Record<string, any>
  body?: Record<string, any>
  params?: Record<string, any>
  headers?: Record<string, string>
} = {}) => {
  const event = {
    node: {
      req: {
        method: 'GET',
        url: '/',
        headers: options.headers || {},
      },
      res: {
        statusCode: 200,
        statusMessage: 'OK',
        setHeader: vi.fn(),
        end: vi.fn(),
      },
    },
    context: {},
    _handled: false,
  }

  // Mock getQuery
  if (options.query) {
    global.getQuery = vi.fn().mockReturnValue(options.query)
  }

  // Mock readBody
  if (options.body) {
    global.readBody = vi.fn().mockResolvedValue(options.body)
  }

  return event
}

/**
 * Mock successful API response
 */
export const mockSuccessResponse = (data: any) => {
  return { success: true, data }
}

/**
 * Mock error API response
 */
export const mockErrorResponse = (message: string, statusCode = 400) => {
  return {
    success: false,
    error: message,
    statusCode
  }
}

/**
 * Helper to test API endpoint handlers
 */
export const testApiEndpoint = async (
  handler: Function,
  mockEvent: any
) => {
  try {
    const result = await handler(mockEvent)
    return { success: true, data: result }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode || 500
    }
  }
}
