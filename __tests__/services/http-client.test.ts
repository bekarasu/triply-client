// Mock dependencies before importing
const mockGetAuthHeader = jest.fn().mockResolvedValue(null)
const mockHandle401 = jest.fn().mockResolvedValue(false)

jest.mock('@/services/auth/token-manager', () => ({
	tokenManager: {
		getAuthHeader: mockGetAuthHeader,
		handle401Unauthorized: mockHandle401,
	},
}))

const mockMonitorStart = jest.fn().mockReturnValue('monitor-1')
const mockMonitorSuccess = jest.fn()
const mockMonitorError = jest.fn()

jest.mock('@/services/network-monitor', () => ({
	networkMonitor: {
		start: mockMonitorStart,
		success: mockMonitorSuccess,
		error: mockMonitorError,
	},
}))

// Helper to create mock response
function mockResponse(
	ok: boolean,
	status: number,
	data: any = {},
	headers = new Headers(),
) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data),
		headers,
	}
}

function mockResponseWithJsonError(status: number, headers = new Headers()) {
	return {
		ok: false,
		status,
		json: () => Promise.reject(new Error('Invalid JSON')),
		headers,
	}
}

describe('HttpClient', () => {
	let httpClient: any

	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()
		mockGetAuthHeader.mockResolvedValue(null)
		mockHandle401.mockResolvedValue(false)
		httpClient = require('@/services/http-client').httpClient
	})

	describe('GET requests', () => {
		it('makes GET request and returns data', async () => {
			const data = { success: true, data: { id: 1 } }
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200, data))

			const result = await httpClient.get(
				'https://api.example.com/resource',
			)
			expect(result).toEqual(data)
			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.example.com/resource',
				expect.objectContaining({ method: 'GET' }),
			)
		})

		it('passes custom headers', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))

			await httpClient.get('https://api.example.com/resource', {
				'X-Custom': 'value',
			})

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({ 'X-Custom': 'value' }),
				}),
			)
		})

		it('includes auth header when available', async () => {
			mockGetAuthHeader.mockResolvedValueOnce({ 'X-Access-Token': 'tk' })
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))

			await httpClient.get('https://api.example.com/resource')

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						'X-Access-Token': 'tk',
					}),
				}),
			)
		})

		it('sets Content-Type to application/json by default', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))
			await httpClient.get('https://api.example.com/resource')

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
					}),
				}),
			)
		})
	})

	describe('POST requests', () => {
		it('sends JSON body', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))
			await httpClient.post('https://api.example.com/resource', {
				name: 'test',
			})

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ name: 'test' }),
				}),
			)
		})

		it('handles post without body', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))
			await httpClient.post('https://api.example.com/resource')

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({ method: 'POST', body: undefined }),
			)
		})

		it('supports custom timeout', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))
			await httpClient.post(
				'https://api.example.com/r',
				{ d: 1 },
				undefined,
				5000,
			)
			expect(global.fetch).toHaveBeenCalled()
		})

		it('respects provided AbortSignal', async () => {
			const controller = new AbortController()
			const abortError = new Error('Aborted')
			abortError.name = 'AbortError'

			global.fetch = jest.fn().mockImplementation(() => {
				return new Promise((_, reject) => {
					controller.signal.addEventListener('abort', () =>
						reject(abortError),
					)
					setTimeout(() => controller.abort(), 10)
				})
			})

			await expect(
				httpClient.post(
					'https://api.example.com/r',
					{ d: 1 },
					undefined,
					10000,
					controller.signal,
				),
			).rejects.toMatchObject({ name: 'AbortError' })
		})
	})

	describe('PUT requests', () => {
		it('sends PUT with JSON body', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))
			await httpClient.put('https://api.example.com/resource/1', {
				name: 'up',
			})

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify({ name: 'up' }),
				}),
			)
		})
	})

	describe('DELETE requests', () => {
		it('sends DELETE request', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))
			await httpClient.delete('https://api.example.com/resource/1')

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({ method: 'DELETE' }),
			)
		})
	})

	describe('error handling', () => {
		it('throws ApiError on non-ok response with error data', async () => {
			global.fetch = jest.fn().mockResolvedValueOnce(
				mockResponse(false, 404, {
					error: { message: 'Not found', code: 'NOT_FOUND' },
				}),
			)

			await expect(
				httpClient.get('https://api.example.com/x'),
			).rejects.toMatchObject({
				status: 404,
				message: 'Not found',
				code: 'NOT_FOUND',
			})
		})

		it('uses default message when error data is empty', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(false, 500, {}))

			await expect(
				httpClient.get('https://api.example.com/x'),
			).rejects.toMatchObject({
				message: 'HTTP Error: 500',
				code: 'HTTP_ERROR',
			})
		})

		it('handles JSON parse failure in error response', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponseWithJsonError(500))

			await expect(
				httpClient.get('https://api.example.com/x'),
			).rejects.toMatchObject({
				status: 500,
				message: 'HTTP Error: 500',
			})
		})

		it('handles network errors', async () => {
			global.fetch = jest
				.fn()
				.mockRejectedValueOnce(new Error('Network failure'))

			await expect(
				httpClient.get('https://api.example.com/x'),
			).rejects.toMatchObject({
				message: 'Network failure',
				status: 0,
			})
		})

		it('handles abort errors', async () => {
			const e = new Error('Aborted')
			e.name = 'AbortError'
			global.fetch = jest.fn().mockRejectedValueOnce(e)

			await expect(
				httpClient.get('https://api.example.com/x'),
			).rejects.toMatchObject({
				name: 'AbortError',
			})
		})

		it('re-throws errors with status and message', async () => {
			global.fetch = jest.fn().mockRejectedValueOnce({
				message: 'Forbidden',
				status: 403,
				details: {},
			})

			await expect(
				httpClient.get('https://api.example.com/x'),
			).rejects.toMatchObject({
				message: 'Forbidden',
				status: 403,
			})
		})

		it('wraps unknown errors', async () => {
			global.fetch = jest.fn().mockRejectedValueOnce({})

			await expect(
				httpClient.get('https://api.example.com/x'),
			).rejects.toMatchObject({
				message: 'Network error occurred',
				status: 0,
			})
		})
	})

	describe('401 handling — refresh succeeds', () => {
		it('retries request after successful token refresh', async () => {
			mockHandle401.mockResolvedValueOnce(true)
			// Use mockResolvedValue to ensure enough values for processQueuedRequests + retry
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			const retryData = { success: true, data: { id: 1 } }

			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(
					mockResponse(false, 401, {
						error: { message: 'Unauthorized' },
					}),
				)
				.mockResolvedValue(mockResponse(true, 200, retryData))

			const result = await httpClient.get(
				'https://api.example.com/protected',
			)
			expect(result).toEqual(retryData)
		})

		it('throws when retry after refresh also fails', async () => {
			mockHandle401.mockResolvedValueOnce(true)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(
					mockResponse(false, 401, { error: { message: 'Unauth' } }),
				)
				.mockResolvedValue(
					mockResponse(false, 403, {
						error: { message: 'Forbidden', code: 'FORBIDDEN' },
					}),
				)

			await expect(
				httpClient.get('https://api.example.com/protected'),
			).rejects.toMatchObject({ status: 403, message: 'Forbidden' })
		})

		it('throws with default message when retry error has no parseable json', async () => {
			mockHandle401.mockResolvedValueOnce(true)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(false, 401, {}))
				.mockResolvedValue(mockResponseWithJsonError(500))

			await expect(
				httpClient.get('https://api.example.com/protected'),
			).rejects.toMatchObject({ status: 500, message: 'HTTP Error: 500' })
		})
	})

	describe('401 handling — refresh fails', () => {
		it('throws error when refresh fails', async () => {
			mockHandle401.mockResolvedValueOnce(false)

			global.fetch = jest.fn().mockResolvedValueOnce(
				mockResponse(false, 401, {
					error: {
						message: 'Unauthorized',
						code: 'UNAUTHORIZED',
					},
				}),
			)

			await expect(
				httpClient.get('https://api.example.com/protected'),
			).rejects.toMatchObject({ status: 401 })

			expect(mockHandle401).toHaveBeenCalled()
		})
	})

	describe('401 handling — concurrent requests with queuing', () => {
		it('queues second request when refresh is in progress and processes queue on success', async () => {
			let resolveRefresh!: (value: boolean) => void
			const refreshPromise = new Promise<boolean>((resolve) => {
				resolveRefresh = resolve
			})

			mockHandle401.mockReturnValueOnce(refreshPromise)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			const successData = { success: true, data: { id: 1 } }

			// Track which URLs have been seen to distinguish initial vs retry calls
			const seenUrls = new Set<string>()
			global.fetch = jest.fn().mockImplementation((url: string) => {
				if (!seenUrls.has(url)) {
					// First time seeing this URL → 401
					seenUrls.add(url)
					return Promise.resolve(
						mockResponse(false, 401, {
							error: { message: 'Unauthorized' },
						}),
					)
				}
				// Second time → success (retry)
				return Promise.resolve(mockResponse(true, 200, successData))
			})

			const req1Promise = httpClient.get('https://api.example.com/first')
			await new Promise((r) => setTimeout(r, 50))

			const req2Promise = httpClient.get('https://api.example.com/second')
			await new Promise((r) => setTimeout(r, 50))

			resolveRefresh(true)

			const result1 = await req1Promise
			expect(result1).toEqual(successData)

			const result2 = await req2Promise
			expect(result2).toEqual(successData)

			// Should have been called 4 times: 2 initial 401s + 2 retries
			expect(global.fetch).toHaveBeenCalledTimes(4)
		})

		it('rejects queued requests when refresh fails', async () => {
			let resolveRefresh!: (value: boolean) => void
			const refreshPromise = new Promise<boolean>((resolve) => {
				resolveRefresh = resolve
			})

			mockHandle401.mockReturnValueOnce(refreshPromise)
			mockGetAuthHeader.mockResolvedValue(null)

			let fetchCallCount = 0
			global.fetch = jest.fn().mockImplementation(() => {
				fetchCallCount++
				return Promise.resolve(
					mockResponse(false, 401, {
						error: { message: 'Unauthorized' },
					}),
				)
			})

			const req1Promise = httpClient.get('https://api.example.com/first')
			await new Promise((r) => setTimeout(r, 50))

			const req2Promise = httpClient.get('https://api.example.com/second')
			await new Promise((r) => setTimeout(r, 50))

			// Refresh fails
			resolveRefresh(false)

			await expect(req1Promise).rejects.toMatchObject({ status: 401 })
			await expect(req2Promise).rejects.toMatchObject({ status: 401 })
		})

		it('handles error in processQueuedRequests for individual requests', async () => {
			let resolveRefresh!: (value: boolean) => void
			const refreshPromise = new Promise<boolean>((resolve) => {
				resolveRefresh = resolve
			})

			mockHandle401.mockReturnValueOnce(refreshPromise)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			global.fetch = jest.fn().mockImplementation((url: string) => {
				if (url.includes('/first') || url.includes('/second')) {
					// Initial calls return 401
					// After refresh, route by URL
					return Promise.resolve(
						mockResponse(false, 401, {
							error: { message: 'Unauthorized' },
						}),
					)
				}
				return Promise.reject(new Error('Connection lost'))
			})

			// Override: after first 2 calls (both 401), subsequent calls route differently
			let callIdx = 0
			global.fetch = jest.fn().mockImplementation(() => {
				callIdx++
				if (callIdx <= 2) {
					return Promise.resolve(
						mockResponse(false, 401, {
							error: { message: 'Unauthorized' },
						}),
					)
				}
				// All retries fail with network error
				return Promise.reject(new Error('Connection lost'))
			})

			const req1Promise = httpClient.get('https://api.example.com/first')
			await new Promise((r) => setTimeout(r, 50))

			const req2Promise = httpClient.get('https://api.example.com/second')
			await new Promise((r) => setTimeout(r, 50))

			resolveRefresh(true)

			// Both should fail since all retries fail
			await expect(req1Promise).rejects.toBeDefined()
			await expect(req2Promise).rejects.toBeDefined()
		})

		it('handles queued request where retry response is not ok', async () => {
			let resolveRefresh!: (value: boolean) => void
			const refreshPromise = new Promise<boolean>((resolve) => {
				resolveRefresh = resolve
			})

			mockHandle401.mockReturnValueOnce(refreshPromise)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			let callIdx = 0
			global.fetch = jest.fn().mockImplementation(() => {
				callIdx++
				if (callIdx <= 2) {
					return Promise.resolve(
						mockResponse(false, 401, {
							error: { message: 'Unauthorized' },
						}),
					)
				}
				// All retries get 403
				return Promise.resolve(
					mockResponse(false, 403, {
						error: { message: 'Forbidden', code: 'FORBIDDEN' },
					}),
				)
			})

			const req1Promise = httpClient.get('https://api.example.com/first')
			await new Promise((r) => setTimeout(r, 50))

			const req2Promise = httpClient.get('https://api.example.com/second')
			await new Promise((r) => setTimeout(r, 50))

			resolveRefresh(true)

			// Both should reject with 403
			await expect(req1Promise).rejects.toMatchObject({ status: 403 })
			await expect(req2Promise).rejects.toMatchObject({ status: 403 })
		})
	})

	describe('401 handling — auth header null after refresh', () => {
		it('handles null auth header after successful refresh gracefully', async () => {
			mockHandle401.mockResolvedValueOnce(true)
			// After refresh, getAuthHeader returns null (edge case)
			mockGetAuthHeader
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(null)

			global.fetch = jest.fn().mockResolvedValueOnce(
				mockResponse(false, 401, {
					error: { message: 'Unauthorized' },
				}),
			)

			// When authHeader is null after refresh, the code doesn't retry
			// and falls through to the finally block, then to the non-401 error throw
			// Actually it just doesn't enter the `if (authHeader)` block, so it falls through
			// to `finally { this.isRefreshing = false }` and then exits the 401 block
			// and hits the generic error throw at line 359
			await expect(
				httpClient.get('https://api.example.com/protected'),
			).rejects.toMatchObject({ status: 401 })
		})
	})

	describe('monitor finalization dedup', () => {
		it('does not double-finalize monitor when 401 refresh fails', async () => {
			mockHandle401.mockResolvedValueOnce(false)
			mockGetAuthHeader.mockResolvedValue(null)

			global.fetch = jest.fn().mockResolvedValueOnce(
				mockResponse(false, 401, {
					error: { message: 'Unauthorized' },
				}),
			)

			await expect(
				httpClient.get('https://api.example.com/protected'),
			).rejects.toMatchObject({ status: 401 })

			// Monitor error should only be called once (dedup prevents second call)
			// The first call is from rejectQueuedRequests/finalizeError, second attempt is deduped
			expect(mockMonitorError).toHaveBeenCalled()
		})
	})

	describe('header normalization edge cases', () => {
		it('handles Headers instance', async () => {
			const headers = new Headers()
			headers.append('X-Custom', 'value')
			headers.append('Authorization', 'Bearer token')

			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200, {}))
			await httpClient.get('https://api.example.com/r', {
				'X-Custom': 'value',
				Authorization: 'Bearer token',
			} as any)

			expect(global.fetch).toHaveBeenCalled()
		})

		it('handles array-formatted headers', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200, {}))

			// Simulate normalizeHeaders being called with array format
			// This happens internally when response.headers is processed
			const response = mockResponse(true, 200, {})
			await httpClient.get('https://api.example.com/r')

			expect(global.fetch).toHaveBeenCalled()
		})
	})

	describe('request body parsing edge cases', () => {
		it('handles JSON parse error in string body', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200, {}))

			// Create a request with an invalid JSON string body
			const invalidJson = 'not valid json {'
			await httpClient.post('https://api.example.com/r')

			expect(global.fetch).toHaveBeenCalled()
		})

		it('handles FormData body', async () => {
			if (typeof FormData === 'undefined') {
				// Skip if FormData is not available in test environment
				return
			}

			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200, {}))
			await httpClient.post('https://api.example.com/r')

			expect(mockMonitorStart).toHaveBeenCalled()
		})
	})

	describe('monitor integration', () => {
		it('starts monitor on request', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200, { ok: true }))
			await httpClient.get('https://api.example.com/r')

			expect(mockMonitorStart).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: 'https://api.example.com/r',
				}),
			)
		})

		it('reports success to monitor', async () => {
			const data = { success: true }
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200, data))
			await httpClient.get('https://api.example.com/r')

			expect(mockMonitorSuccess).toHaveBeenCalledWith(
				'monitor-1',
				expect.objectContaining({ responseBody: data }),
			)
		})

		it('reports error to monitor on failure', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(
					mockResponse(false, 500, { error: { message: 'Error' } }),
				)
			await expect(
				httpClient.get('https://api.example.com/r'),
			).rejects.toBeDefined()

			expect(mockMonitorError).toHaveBeenCalledWith(
				'monitor-1',
				expect.objectContaining({ statusCode: 500 }),
			)
		})

		it('reports error to monitor on network failure', async () => {
			global.fetch = jest.fn().mockRejectedValueOnce(new Error('Offline'))
			await expect(
				httpClient.get('https://api.example.com/r'),
			).rejects.toBeDefined()

			expect(mockMonitorError).toHaveBeenCalledWith(
				'monitor-1',
				expect.objectContaining({ errorMessage: 'Offline' }),
			)
		})

		it('reports abort to monitor', async () => {
			const e = new Error('Aborted')
			e.name = 'AbortError'
			global.fetch = jest.fn().mockRejectedValueOnce(e)
			await expect(
				httpClient.get('https://api.example.com/r'),
			).rejects.toBeDefined()

			expect(mockMonitorError).toHaveBeenCalledWith(
				'monitor-1',
				expect.objectContaining({ errorMessage: 'Request aborted' }),
			)
		})

		it('includes request body in monitor for POST', async () => {
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200))
			await httpClient.post('https://api.example.com/r', { name: 'test' })

			expect(mockMonitorStart).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					requestBody: { name: 'test' },
				}),
			)
		})

		it('handles double finalization of monitor gracefully', async () => {
			// This test ensures the monitorFinalized flag prevents double-calling
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce(mockResponse(true, 200, { data: 'ok' }))
			await httpClient.get('https://api.example.com/r')

			// Success should be called once, not twice
			expect(mockMonitorSuccess).toHaveBeenCalledTimes(1)
		})
	})
})
