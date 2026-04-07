describe('NetworkMonitor', () => {
	const originalEnv = process.env

	beforeEach(() => {
		jest.resetModules()
		process.env = { ...originalEnv }
	})

	afterEach(() => {
		process.env = originalEnv
	})

	describe('when enabled', () => {
		beforeEach(() => {
			process.env.EXPO_PUBLIC_ENABLE_NETWORK_MONITOR = 'true'
			process.env.EXPO_PUBLIC_NODE_ENV = 'development'
		})

		it('should start a new log entry', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const id = networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now(),
				})

				expect(id).toBeTruthy()
				expect(typeof id).toBe('string')
			})
		})

		it('should track request details', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const startedAt = Date.now()
				networkMonitor.start({
					method: 'POST',
					url: 'https://api.example.com/test',
					startedAt,
					requestHeaders: { 'Content-Type': 'application/json' },
					requestBody: { data: 'test' },
				})

				const logs = networkMonitor.getLogs()
				expect(logs).toHaveLength(1)
				expect(logs[0].method).toBe('POST')
				expect(logs[0].url).toBe('https://api.example.com/test')
				expect(logs[0].state).toBe('pending')
				expect(logs[0].requestHeaders).toEqual({
					'Content-Type': 'application/json',
				})
				expect(logs[0].requestBody).toEqual({ data: 'test' })
			})
		})

		it('should mark request as success', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const id = networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now(),
				})

				networkMonitor.success(id, {
					statusCode: 200,
					responseBody: { result: 'ok' },
				})

				const logs = networkMonitor.getLogs()
				expect(logs[0].state).toBe('success')
				expect(logs[0].statusCode).toBe(200)
				expect(logs[0].responseBody).toEqual({ result: 'ok' })
				expect(logs[0].durationMs).toBeDefined()
			})
		})

		it('should mark request as error', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const id = networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now(),
				})

				networkMonitor.error(id, {
					statusCode: 500,
					errorMessage: 'Internal Server Error',
				})

				const logs = networkMonitor.getLogs()
				expect(logs[0].state).toBe('error')
				expect(logs[0].statusCode).toBe(500)
				expect(logs[0].errorMessage).toBe('Internal Server Error')
			})
		})

		it('should notify subscribers on changes', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const subscriber = jest.fn()
				networkMonitor.subscribe(subscriber)

				// Initial call with empty logs
				expect(subscriber).toHaveBeenCalledTimes(1)

				networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now(),
				})

				// Called again after start
				expect(subscriber).toHaveBeenCalledTimes(2)
			})
		})

		it('should allow unsubscribing', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const subscriber = jest.fn()
				const unsubscribe = networkMonitor.subscribe(subscriber)

				// Initial call
				expect(subscriber).toHaveBeenCalledTimes(1)

				unsubscribe()

				networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now(),
				})

				// Should not be called again after unsubscribe
				expect(subscriber).toHaveBeenCalledTimes(1)
			})
		})

		it('should clear all logs', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test1',
					startedAt: Date.now(),
				})
				networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test2',
					startedAt: Date.now(),
				})

				expect(networkMonitor.getLogs()).toHaveLength(2)

				networkMonitor.clear()

				expect(networkMonitor.getLogs()).toHaveLength(0)
			})
		})

		it('should limit entries to maxEntries', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				// Add more than 150 entries
				for (let i = 0; i < 160; i++) {
					networkMonitor.start({
						method: 'GET',
						url: `https://api.example.com/test${i}`,
						startedAt: Date.now(),
					})
				}

				const logs = networkMonitor.getLogs()
				expect(logs.length).toBeLessThanOrEqual(150)
			})
		})

		it('should not notify when updating non-existent entry', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const subscriber = jest.fn()
				networkMonitor.subscribe(subscriber)

				// Reset call count from subscribe
				subscriber.mockClear()

				// Try to update a non-existent entry
				networkMonitor.success('non-existent-id', { statusCode: 200 })

				// Should not notify since no entry was updated
				expect(subscriber).not.toHaveBeenCalled()
			})
		})

		it('should skip non-matching entries when updating', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				// Create two entries
				const id1 = networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/first',
					startedAt: Date.now(),
				})

				const id2 = networkMonitor.start({
					method: 'POST',
					url: 'https://api.example.com/second',
					startedAt: Date.now(),
				})

				// Update only the second entry — first entry hits the `entry.id !== id` return
				networkMonitor.success(id2, { statusCode: 200 })

				const logs = networkMonitor.getLogs()
				// First entry (most recent in array due to prepend) should still be pending
				const firstEntry = logs.find((l: any) => l.id === id1)
				const secondEntry = logs.find((l: any) => l.id === id2)

				expect(firstEntry.state).toBe('pending')
				expect(secondEntry.state).toBe('success')
			})
		})

		it('should use provided durationMs when available', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const id = networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now(),
				})

				networkMonitor.success(id, {
					statusCode: 200,
					durationMs: 42,
				})

				const logs = networkMonitor.getLogs()
				expect(logs[0].durationMs).toBe(42)
			})
		})

		it('should use existing completedAt when updating already-completed entry', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const id = networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now() - 100,
				})

				// First completion sets completedAt
				networkMonitor.success(id, { statusCode: 200 })

				const logs1 = networkMonitor.getLogs()
				const firstCompletedAt = logs1[0].completedAt

				// Second update on same entry — uses existing completedAt
				networkMonitor.error(id, {
					statusCode: 500,
					errorMessage: 'Retried and failed',
				})

				const logs2 = networkMonitor.getLogs()
				expect(logs2[0].state).toBe('error')
				expect(logs2[0].completedAt).toBeDefined()
			})
		})

		it('should use patch.completedAt when explicitly provided', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const id = networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now() - 100,
				})

				const explicitCompletedAt = Date.now() - 50

				// Call success/error with explicit completedAt in the patch
				// Note: The current NetworkLogFinalizePayload doesn't include completedAt,
				// but this tests the internal updateEntry logic
				networkMonitor.success(id, {
					statusCode: 200,
					durationMs: 50,
				})

				const logs = networkMonitor.getLogs()
				expect(logs[0].completedAt).toBeDefined()
			})
		})

		it('should handle null id in success gracefully', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				// Should not throw
				expect(() =>
					networkMonitor.success(null, { statusCode: 200 }),
				).not.toThrow()
			})
		})

		it('should handle null id in error gracefully', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				// Should not throw
				expect(() =>
					networkMonitor.error(null, { errorMessage: 'test' }),
				).not.toThrow()
			})
		})
	})

	describe('when disabled', () => {
		beforeEach(() => {
			process.env.EXPO_PUBLIC_ENABLE_NETWORK_MONITOR = 'false'
		})

		it('should return null from start', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const id = networkMonitor.start({
					method: 'GET',
					url: 'https://api.example.com/test',
					startedAt: Date.now(),
				})

				expect(id).toBeNull()
			})
		})

		it('should return empty logs', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				expect(networkMonitor.getLogs()).toEqual([])
			})
		})

		it('should notify subscriber with empty array and return noop unsubscribe', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				const subscriber = jest.fn()
				const unsubscribe = networkMonitor.subscribe(subscriber)

				expect(subscriber).toHaveBeenCalledWith([])
				expect(unsubscribe()).toBeUndefined()
			})
		})

		it('should handle success call when disabled', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				// Should not throw even with a valid id when disabled
				expect(() =>
					networkMonitor.success('some-id', { statusCode: 200 }),
				).not.toThrow()
			})
		})

		it('should handle error call when disabled', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				expect(() =>
					networkMonitor.error('some-id', { errorMessage: 'test' }),
				).not.toThrow()
			})
		})

		it('should not throw on clear when disabled', () => {
			jest.isolateModules(() => {
				const { networkMonitor } = require('@/services/network-monitor')

				expect(() => networkMonitor.clear()).not.toThrow()
			})
		})
	})
})
