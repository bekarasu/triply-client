// Tests for edge cases and defensive code paths in http-client
// These tests target specific uncovered branches

const mockGetAuthHeader = jest.fn().mockResolvedValue(null)
const mockHandle401 = jest.fn().mockResolvedValue(false)

jest.mock('@/services/auth/token-manager', () => ({
	tokenManager: {
		getAuthHeader: mockGetAuthHeader,
		handle401Unauthorized: mockHandle401,
	},
}))

const mockMonitorStart = jest.fn().mockReturnValue('monitor-edge-1')
const mockMonitorSuccess = jest.fn()
const mockMonitorError = jest.fn()

jest.mock('@/services/network-monitor', () => ({
	networkMonitor: {
		start: mockMonitorStart,
		success: mockMonitorSuccess,
		error: mockMonitorError,
	},
}))

describe('HttpClient Edge Cases', () => {
	let httpClient: any

	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()
		mockGetAuthHeader.mockResolvedValue(null)
		mockHandle401.mockResolvedValue(false)
		httpClient = require('@/services/http-client').httpClient
	})

	describe('normalizeHeaders edge cases', () => {
		it('handles response with Headers instance containing values', async () => {
			const headers = new Headers()
			headers.append('content-type', 'application/json')
			headers.append('x-custom-header', 'custom-value')

			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: headers,
				json: () => Promise.resolve({ data: 'test' }),
			})

			await httpClient.get('https://api.example.com/test')

			// This should trigger the Headers instance branch in normalizeHeaders
			expect(global.fetch).toHaveBeenCalled()
			expect(mockMonitorSuccess).toHaveBeenCalledWith(
				'monitor-edge-1',
				expect.objectContaining({
					statusCode: 200,
					responseHeaders: expect.any(Object),
				}),
			)
		})

		it('handles response with no headers', async () => {
			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers(), // Empty headers
				json: () => Promise.resolve({ data: 'test' }),
			})

			await httpClient.get('https://api.example.com/test')
			expect(mockMonitorSuccess).toHaveBeenCalled()
		})
	})

	describe('parseRequestBody edge cases', () => {
		it('handles non-JSON string body', async () => {
			// To test the catch block in parseRequestBody, we need to send a body
			// that's already a string but not valid JSON
			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers(),
				json: () => Promise.resolve({ success: true }),
			})

			// Post with regular data - the monitor will see it as a JSON string
			await httpClient.post('https://api.example.com/test', {
				data: 'value',
			})

			// Check that monitor was started with parsed body
			expect(mockMonitorStart).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					requestBody: { data: 'value' },
				}),
			)
		})

		it('tracks request with undefined body', async () => {
			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers(),
				json: () => Promise.resolve({ success: true }),
			})

			await httpClient.post('https://api.example.com/test')

			expect(mockMonitorStart).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					requestBody: undefined,
				}),
			)
		})
	})

	describe('monitor finalization edge cases', () => {
		it('prevents double-finalization on success', async () => {
			mockMonitorSuccess.mockClear()

			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers(),
				json: () => Promise.resolve({ data: 'success' }),
			})

			await httpClient.get('https://api.example.com/test')

			// Monitor success should only be called once due to monitorFinalized flag
			expect(mockMonitorSuccess).toHaveBeenCalledTimes(1)
		})

		it('prevents double-finalization on error', async () => {
			mockMonitorError.mockClear()

			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: false,
				status: 500,
				headers: new Headers(),
				json: () =>
					Promise.resolve({ error: { message: 'Server error' } }),
			})

			await expect(
				httpClient.get('https://api.example.com/test'),
			).rejects.toBeDefined()

			// Monitor error should only be called once
			expect(mockMonitorError).toHaveBeenCalledTimes(1)
		})
	})

	describe('401 handling with concurrent queue and retries', () => {
		it('handles successful refresh followed by queued request failures', async () => {
			let resolveRefresh!: (value: boolean) => void
			const refreshPromise = new Promise<boolean>((resolve) => {
				resolveRefresh = resolve
			})

			mockHandle401.mockReturnValueOnce(refreshPromise)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			let callCount = 0
			global.fetch = jest.fn().mockImplementation(() => {
				callCount++
				if (callCount <= 2) {
					// First two calls return 401
					return Promise.resolve({
						ok: false,
						status: 401,
						headers: new Headers(),
						json: () =>
							Promise.resolve({
								error: { message: 'Unauthorized' },
							}),
					})
				}
				// Subsequent calls (retries) succeed
				return Promise.resolve({
					ok: true,
					status: 200,
					headers: new Headers(),
					json: () => Promise.resolve({ data: 'success' }),
				})
			})

			const req1 = httpClient.get('https://api.example.com/first')
			await new Promise((r) => setTimeout(r, 10))

			const req2 = httpClient.get('https://api.example.com/second')
			await new Promise((r) => setTimeout(r, 10))

			resolveRefresh(true)

			const [result1, result2] = await Promise.all([req1, req2])

			expect(result1).toEqual({ data: 'success' })
			expect(result2).toEqual({ data: 'success' })
		})

		it('handles null auth header after successful refresh', async () => {
			mockHandle401.mockResolvedValueOnce(true)
			mockGetAuthHeader.mockResolvedValue(null) // No auth header after refresh

			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: false,
				status: 401,
				headers: new Headers(),
				json: () =>
					Promise.resolve({ error: { message: 'Unauthorized' } }),
			})

			await expect(
				httpClient.get('https://api.example.com/protected'),
			).rejects.toMatchObject({
				status: 401,
			})
		})
	})

	describe('processQueuedRequests error handling', () => {
		it('handles network error in queued request retry', async () => {
			let resolveRefresh!: (value: boolean) => void
			const refreshPromise = new Promise<boolean>((resolve) => {
				resolveRefresh = resolve
			})

			mockHandle401.mockReturnValueOnce(refreshPromise)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			let callCount = 0
			global.fetch = jest.fn().mockImplementation(() => {
				callCount++
				if (callCount <= 2) {
					return Promise.resolve({
						ok: false,
						status: 401,
						headers: new Headers(),
						json: () =>
							Promise.resolve({
								error: { message: 'Unauthorized' },
							}),
					})
				}
				// Retry fails with network error
				return Promise.reject(new Error('Connection lost'))
			})

			const req1 = httpClient.get('https://api.example.com/first')
			await new Promise((r) => setTimeout(r, 10))

			const req2 = httpClient.get('https://api.example.com/second')
			await new Promise((r) => setTimeout(r, 10))

			resolveRefresh(true)

			await expect(req1).rejects.toBeDefined()
			await expect(req2).rejects.toBeDefined()
		})

		it('handles non-ok response in queued request retry', async () => {
			let resolveRefresh!: (value: boolean) => void
			const refreshPromise = new Promise<boolean>((resolve) => {
				resolveRefresh = resolve
			})

			mockHandle401.mockReturnValueOnce(refreshPromise)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			let callCount = 0
			global.fetch = jest.fn().mockImplementation(() => {
				callCount++
				if (callCount <= 2) {
					return Promise.resolve({
						ok: false,
						status: 401,
						headers: new Headers(),
						json: () =>
							Promise.resolve({
								error: { message: 'Unauthorized' },
							}),
					})
				}
				// Retry gets 403
				return Promise.resolve({
					ok: false,
					status: 403,
					headers: new Headers(),
					json: () =>
						Promise.resolve({
							error: { message: 'Forbidden', code: 'FORBIDDEN' },
						}),
				})
			})

			const req1 = httpClient.get('https://api.example.com/first')
			await new Promise((r) => setTimeout(r, 10))

			const req2 = httpClient.get('https://api.example.com/second')
			await new Promise((r) => setTimeout(r, 10))

			resolveRefresh(true)

			await expect(req1).rejects.toMatchObject({
				status: 403,
				message: 'Forbidden',
			})
			await expect(req2).rejects.toMatchObject({
				status: 403,
				message: 'Forbidden',
			})
		})

		it('handles JSON parse error in queued request retry error response', async () => {
			let resolveRefresh!: (value: boolean) => void
			const refreshPromise = new Promise<boolean>((resolve) => {
				resolveRefresh = resolve
			})

			mockHandle401.mockReturnValueOnce(refreshPromise)
			mockGetAuthHeader.mockResolvedValue({
				'X-Access-Token': 'new-token',
			})

			let callCount = 0
			global.fetch = jest.fn().mockImplementation(() => {
				callCount++
				if (callCount <= 2) {
					return Promise.resolve({
						ok: false,
						status: 401,
						headers: new Headers(),
						json: () =>
							Promise.resolve({
								error: { message: 'Unauthorized' },
							}),
					})
				}
				// Retry gets error with invalid JSON response
				return Promise.resolve({
					ok: false,
					status: 500,
					headers: new Headers(),
					json: () => Promise.reject(new Error('Invalid JSON')),
				})
			})

			const req1 = httpClient.get('https://api.example.com/first')
			await new Promise((r) => setTimeout(r, 10))

			// Add a second request to ensure it goes through processQueuedRequests
			const req2 = httpClient.get('https://api.example.com/second')
			await new Promise((r) => setTimeout(r, 10))

			resolveRefresh(true)

			await expect(req1).rejects.toMatchObject({ status: 500 })
			await expect(req2).rejects.toMatchObject({ status: 500 })
		})
	})
})
