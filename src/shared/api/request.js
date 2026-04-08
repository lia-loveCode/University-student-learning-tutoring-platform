/**
 * Very small request layer that works for both:
 * - mock (local data) calls
 * - future real HTTP calls
 *
 * Rule: module api functions return Promises and never expose storage details to UI.
 */

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', cause } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    if (cause) this.cause = cause
  }
}

/**
 * Wrap a mock handler with optional latency and error mapping.
 * @template T
 * @param {() => T | Promise<T>} handler
 * @param {{ minDelayMs?: number, maxDelayMs?: number }} [opts]
 * @returns {Promise<T>}
 */
export async function mockRequest(handler, opts = {}) {
  const { minDelayMs = 120, maxDelayMs = 320 } = opts
  const jitter = Math.max(minDelayMs, Math.floor(Math.random() * maxDelayMs))
  await delay(jitter)

  try {
    return await handler()
  } catch (e) {
    throw new ApiError('Mock request failed', { code: 'MOCK_FAILED', cause: e })
  }
}

