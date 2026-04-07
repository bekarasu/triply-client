import AsyncStorage from '@react-native-async-storage/async-storage'
import { TokenManager } from '@/services/auth/token-manager'

// Mock expo-router
jest.mock('expo-router', () => ({
	router: {
		replace: jest.fn(),
	},
}))

// Mock fetch
global.fetch = jest.fn()

describe('TokenManager', () => {
	let tokenManager: TokenManager

	const mockToken = {
		accessToken: 'test-access-token',
		refreshToken: 'test-refresh-token',
		expiresIn: 3600,
	}

	beforeEach(async () => {
		jest.clearAllMocks()
		await AsyncStorage.clear()
		tokenManager = new TokenManager()
	})

	describe('getStoredToken', () => {
		it('returns null when no token is stored', async () => {
			const result = await tokenManager.getStoredToken()
			expect(result).toBeNull()
		})

		it('returns stored token when available', async () => {
			await AsyncStorage.setItem('auth_token', JSON.stringify(mockToken))
			const result = await tokenManager.getStoredToken()
			expect(result).toEqual(mockToken)
		})

		it('returns null when token parsing fails', async () => {
			await AsyncStorage.setItem('auth_token', 'invalid-json')
			const result = await tokenManager.getStoredToken()
			expect(result).toBeNull()
		})

		it('returns null when AsyncStorage throws', async () => {
			jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(
				new Error('Storage error'),
			)
			const result = await tokenManager.getStoredToken()
			expect(result).toBeNull()
		})
	})

	describe('storeTokens', () => {
		it('stores token and refresh token in AsyncStorage', async () => {
			await tokenManager.storeTokens(mockToken)

			const storedToken = await AsyncStorage.getItem('auth_token')
			const storedRefreshToken =
				await AsyncStorage.getItem('refresh_token')

			expect(JSON.parse(storedToken!)).toEqual(mockToken)
			expect(storedRefreshToken).toBe(mockToken.refreshToken)
		})

		it('throws error when AsyncStorage fails', async () => {
			jest.spyOn(AsyncStorage, 'multiSet').mockRejectedValueOnce(
				new Error('Storage error'),
			)

			await expect(tokenManager.storeTokens(mockToken)).rejects.toThrow(
				'Storage error',
			)
		})
	})

	describe('getAuthHeader', () => {
		it('returns null when no token is stored', async () => {
			const result = await tokenManager.getAuthHeader()
			expect(result).toBeNull()
		})

		it('returns auth header with access token', async () => {
			await AsyncStorage.setItem('auth_token', JSON.stringify(mockToken))
			const result = await tokenManager.getAuthHeader()
			expect(result).toEqual({
				'X-Access-Token': mockToken.accessToken,
			})
		})

		it('returns null when error occurs', async () => {
			jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(
				new Error('Error'),
			)
			const result = await tokenManager.getAuthHeader()
			expect(result).toBeNull()
		})
	})

	describe('refreshToken', () => {
		it('returns false when no refresh token is available', async () => {
			const result = await tokenManager.refreshToken()
			expect(result).toBe(false)
		})

		it('returns true on successful token refresh', async () => {
			await AsyncStorage.setItem('auth_token', JSON.stringify(mockToken))

			const newToken = {
				accessToken: 'new-access-token',
				refreshToken: 'new-refresh-token',
				expiresIn: 3600,
			}

			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						data: { token: newToken },
					}),
			})

			const result = await tokenManager.refreshToken()
			expect(result).toBe(true)

			const stored = await AsyncStorage.getItem('auth_token')
			expect(JSON.parse(stored!)).toEqual(newToken)
		})

		it('returns false when refresh request fails', async () => {
			await AsyncStorage.setItem('auth_token', JSON.stringify(mockToken))

			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 401,
			})

			const result = await tokenManager.refreshToken()
			expect(result).toBe(false)
		})

		it('returns false when network error occurs', async () => {
			await AsyncStorage.setItem('auth_token', JSON.stringify(mockToken))

			;(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Network error'),
			)

			const result = await tokenManager.refreshToken()
			expect(result).toBe(false)
		})

		it('waits for existing refresh request if one is in progress', async () => {
			await AsyncStorage.setItem('auth_token', JSON.stringify(mockToken))

			const newToken = {
				accessToken: 'new-access-token',
				refreshToken: 'new-refresh-token',
				expiresIn: 3600,
			}

			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						data: { token: newToken },
					}),
			})

			// Call refresh twice concurrently
			const [result1, result2] = await Promise.all([
				tokenManager.refreshToken(),
				tokenManager.refreshToken(),
			])

			expect(result1).toBe(true)
			expect(result2).toBe(true)
			// Should only have one fetch call
			expect(global.fetch).toHaveBeenCalledTimes(1)
		})
	})

	describe('clearTokens', () => {
		it('removes all tokens from AsyncStorage', async () => {
			await AsyncStorage.setItem('auth_token', JSON.stringify(mockToken))
			await AsyncStorage.setItem(
				'refresh_token',
				mockToken.refreshToken,
			)
			await AsyncStorage.setItem('user_data', JSON.stringify({}))

			await tokenManager.clearTokens()

			expect(await AsyncStorage.getItem('auth_token')).toBeNull()
			expect(await AsyncStorage.getItem('refresh_token')).toBeNull()
			expect(await AsyncStorage.getItem('user_data')).toBeNull()
		})

		it('throws error when AsyncStorage fails', async () => {
			jest.spyOn(AsyncStorage, 'multiRemove').mockRejectedValueOnce(
				new Error('Storage error'),
			)

			await expect(tokenManager.clearTokens()).rejects.toThrow(
				'Storage error',
			)
		})
	})

	describe('handle401Unauthorized', () => {
		it('returns true when token refresh succeeds', async () => {
			await AsyncStorage.setItem('auth_token', JSON.stringify(mockToken))

			const newToken = {
				accessToken: 'new-access-token',
				refreshToken: 'new-refresh-token',
				expiresIn: 3600,
			}

			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						data: { token: newToken },
					}),
			})

			const result = await tokenManager.handle401Unauthorized()
			expect(result).toBe(true)
		})

		it('clears tokens and redirects to login when refresh fails', async () => {
			const { router } = require('expo-router')

			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 401,
			})

			const result = await tokenManager.handle401Unauthorized()

			expect(result).toBe(false)
			expect(router.replace).toHaveBeenCalledWith('/login')
		})

		it('handles errors during fallback gracefully', async () => {
			const { router } = require('expo-router')

			;(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Network error'),
			)

			const result = await tokenManager.handle401Unauthorized()

			expect(result).toBe(false)
			expect(router.replace).toHaveBeenCalledWith('/login')
		})

		it('clears trip data when refresh fails', async () => {
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 401,
			})

			const result = await tokenManager.handle401Unauthorized()
			expect(result).toBe(false)
		})

		it('handles error in fallback when clearTokens also throws', async () => {
			const { router } = require('expo-router')

			// First, refreshToken throws
			;(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Network error'),
			)

			// clearTokens will succeed (AsyncStorage mock works)
			const result = await tokenManager.handle401Unauthorized()

			expect(result).toBe(false)
			expect(router.replace).toHaveBeenCalledWith('/login')
		})

		it('handles complete fallback failure gracefully', async () => {
			// refreshToken throws
			;(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Network error'),
			)

			// Make clearTokens also throw in the catch block
			const multiRemoveSpy = jest
				.spyOn(AsyncStorage, 'multiRemove')
				.mockRejectedValueOnce(new Error('Storage error'))

			const result = await tokenManager.handle401Unauthorized()

			expect(result).toBe(false)
			multiRemoveSpy.mockRestore()
		})
	})
})
