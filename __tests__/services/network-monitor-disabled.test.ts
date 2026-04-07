// Mock env-config to return disabled monitor BEFORE network-monitor loads
jest.mock('@/utils/env-config', () => ({
	ENV_CONFIG: {
		ENABLE_NETWORK_MONITOR: false,
		NODE_ENV: 'development',
		RECOMMENDATION_SERVICE_URL: 'http://localhost:3001',
		USER_SERVICE_URL: 'http://localhost:3002',
		TRAVEL_SERVICE_URL: 'http://localhost:3003',
		API_TIMEOUT: 10000,
		validate: () => true,
	},
	isDevelopment: () => true,
	isStaging: () => false,
	isProduction: () => false,
	isNetworkMonitorEnabled: () => false,
}))

import { networkMonitor } from '@/services/network-monitor'

describe('NetworkMonitor when disabled via mock', () => {
	it('has isEnabled set to false', () => {
		expect(networkMonitor.isEnabled).toBe(false)
	})

	it('returns early from success with valid id', () => {
		// Hits the !this.isEnabled true branch in success()
		expect(() => networkMonitor.success('some-id', { statusCode: 200 })).not.toThrow()
	})

	it('returns early from error with valid id', () => {
		// Hits the !this.isEnabled true branch in error()
		expect(() => networkMonitor.error('some-id', { errorMessage: 'err' })).not.toThrow()
	})

	it('returns null from start', () => {
		const id = networkMonitor.start({
			method: 'GET',
			url: 'https://test.com',
			startedAt: Date.now(),
		})
		expect(id).toBeNull()
	})

	it('returns empty logs', () => {
		expect(networkMonitor.getLogs()).toEqual([])
	})
})
