// Opt out of the global Logger mock so we can test the real implementation
jest.unmock('@/services/logger')

describe('Logger', () => {
	const originalEnv = process.env

	beforeEach(() => {
		jest.resetModules()
		process.env = { ...originalEnv }
		jest.spyOn(console, 'log').mockImplementation()
	})

	afterEach(() => {
		process.env = originalEnv
		jest.restoreAllMocks()
	})

	describe('log', () => {
		it('logs message to console', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'development'
			const { Logger } = require('@/services/logger')

			Logger.log('test message', 'extra')

			expect(console.log).toHaveBeenCalledWith('test message', 'extra')
		})
	})

	describe('error', () => {
		it('logs error details in non-production', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'development'
			const { Logger } = require('@/services/logger')

			Logger.error('Error occurred:', { code: 500 })

			expect(console.log).toHaveBeenCalledWith('Error occurred:', {
				code: 500,
			})
		})

		it('suppresses error details in production', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'production'
			const { Logger } = require('@/services/logger')

			Logger.error('Sensitive error:', { secret: 'data' })

			expect(console.log).toHaveBeenCalledWith(
				'Error occurred. Check logs for details.',
			)
			expect(console.log).not.toHaveBeenCalledWith(
				'Sensitive error:',
				expect.anything(),
			)
		})

		it('returns early in production without logging error details', () => {
			process.env.EXPO_PUBLIC_NODE_ENV = 'production'
			const { Logger } = require('@/services/logger')

			Logger.error('should not appear')

			expect(console.log).toHaveBeenCalledTimes(1)
			expect(console.log).toHaveBeenCalledWith(
				'Error occurred. Check logs for details.',
			)
		})
	})
})
