describe('env-config', () => {
	const originalEnv = process.env
	let consoleWarnSpy: jest.SpyInstance

	beforeEach(() => {
		jest.resetModules()
		process.env = { ...originalEnv }
		// Suppress console.warn for tests that intentionally trigger validation warnings
		consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
	})

	afterEach(() => {
		process.env = originalEnv
		consoleWarnSpy.mockRestore()
	})

	describe('ENV_CONFIG', () => {
		it('uses default NODE_ENV of development when not set', () => {
			delete process.env.EXPO_PUBLIC_NODE_ENV

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.NODE_ENV).toBe('development')
			})
		})

		it('uses provided NODE_ENV value', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'production'

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.NODE_ENV).toBe('production')
			})
		})

		it('uses default service URLs when not provided', () => {
			delete process.env.EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL
			delete process.env.EXPO_PUBLIC_USER_SERVICE_URL
			delete process.env.EXPO_PUBLIC_TRAVEL_SERVICE_URL

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.RECOMMENDATION_SERVICE_URL).toBe(
					'http://localhost:3001/recommendation-service',
				)
				expect(ENV_CONFIG.USER_SERVICE_URL).toBe(
					'http://localhost:3002/user-service',
				)
				expect(ENV_CONFIG.TRAVEL_SERVICE_URL).toBe(
					'http://localhost:3003/travel-service',
				)
			})
		})

		it('uses provided service URLs', () => {
			process.env.EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL =
				'https://api.example.com/rec'
			process.env.EXPO_PUBLIC_USER_SERVICE_URL =
				'https://api.example.com/user'
			process.env.EXPO_PUBLIC_TRAVEL_SERVICE_URL =
				'https://api.example.com/travel'

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.RECOMMENDATION_SERVICE_URL).toBe(
					'https://api.example.com/rec',
				)
				expect(ENV_CONFIG.USER_SERVICE_URL).toBe(
					'https://api.example.com/user',
				)
				expect(ENV_CONFIG.TRAVEL_SERVICE_URL).toBe(
					'https://api.example.com/travel',
				)
			})
		})

		it('uses default API timeout of 10000 when not provided', () => {
			delete process.env.EXPO_PUBLIC_API_TIMEOUT

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.API_TIMEOUT).toBe(10000)
			})
		})

		it('parses API timeout as number', () => {
			process.env.EXPO_PUBLIC_API_TIMEOUT = '30000'

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.API_TIMEOUT).toBe(30000)
			})
		})

		it('enables network monitor by default in development', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'development'
			delete process.env.EXPO_PUBLIC_ENABLE_NETWORK_MONITOR

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.ENABLE_NETWORK_MONITOR).toBe(true)
			})
		})

		it('disables network monitor by default in production', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'production'
			delete process.env.EXPO_PUBLIC_ENABLE_NETWORK_MONITOR

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.ENABLE_NETWORK_MONITOR).toBe(false)
			})
		})

		it('respects explicit ENABLE_NETWORK_MONITOR setting', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'development'
			process.env.EXPO_PUBLIC_ENABLE_NETWORK_MONITOR = 'false'

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.ENABLE_NETWORK_MONITOR).toBe(false)
			})
		})
	})

	describe('validate', () => {
		it('returns true when all required variables are set', () => {
			process.env.EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL =
				'https://api.example.com/rec'
			process.env.EXPO_PUBLIC_USER_SERVICE_URL =
				'https://api.example.com/user'
			process.env.EXPO_PUBLIC_TRAVEL_SERVICE_URL =
				'https://api.example.com/travel'

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.validate()).toBe(true)
			})
		})

		it('returns false when required variables are missing', () => {
			delete process.env.EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL
			delete process.env.EXPO_PUBLIC_USER_SERVICE_URL
			delete process.env.EXPO_PUBLIC_TRAVEL_SERVICE_URL

			jest.isolateModules(() => {
				const { ENV_CONFIG } = require('@/utils/env-config')
				expect(ENV_CONFIG.validate()).toBe(false)
			})
		})
	})

	describe('environment check functions', () => {
		it('isDevelopment returns true in development', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'development'

			jest.isolateModules(() => {
				const { isDevelopment } = require('@/utils/env-config')
				expect(isDevelopment()).toBe(true)
			})
		})

		it('isDevelopment returns false in production', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'production'

			jest.isolateModules(() => {
				const { isDevelopment } = require('@/utils/env-config')
				expect(isDevelopment()).toBe(false)
			})
		})

		it('isStaging returns true in staging', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'staging'

			jest.isolateModules(() => {
				const { isStaging } = require('@/utils/env-config')
				expect(isStaging()).toBe(true)
			})
		})

		it('isStaging returns false in development', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'development'

			jest.isolateModules(() => {
				const { isStaging } = require('@/utils/env-config')
				expect(isStaging()).toBe(false)
			})
		})

		it('isProduction returns true in production', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'production'

			jest.isolateModules(() => {
				const { isProduction } = require('@/utils/env-config')
				expect(isProduction()).toBe(true)
			})
		})

		it('isProduction returns false in development', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'development'

			jest.isolateModules(() => {
				const { isProduction } = require('@/utils/env-config')
				expect(isProduction()).toBe(false)
			})
		})

		it('isNetworkMonitorEnabled returns correct value', () => {
			process.env.EXPO_PUBLIC_ENABLE_NETWORK_MONITOR = 'true'

			jest.isolateModules(() => {
				const {
					isNetworkMonitorEnabled,
				} = require('@/utils/env-config')
				expect(isNetworkMonitorEnabled()).toBe(true)
			})
		})
	})
})
