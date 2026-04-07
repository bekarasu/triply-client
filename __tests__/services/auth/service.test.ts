import AsyncStorage from '@react-native-async-storage/async-storage'

// Mock the http client
jest.mock('@/services/http-client', () => ({
	httpClient: {
		post: jest.fn(),
		get: jest.fn(),
	},
}))

// Mock token manager
jest.mock('@/services/auth/token-manager', () => ({
	tokenManager: {
		storeTokens: jest.fn(),
		getStoredToken: jest.fn(),
		clearTokens: jest.fn(),
		getAuthHeader: jest.fn(),
		refreshToken: jest.fn(),
		handle401Unauthorized: jest.fn(),
	},
}))

// Mock expo-router
jest.mock('expo-router', () => ({
	router: {
		replace: jest.fn(),
	},
}))

describe('AuthService', () => {
	let authService: any
	let httpClient: any
	let tokenManager: any

	const mockToken = {
		accessToken: 'test-access-token',
		refreshToken: 'test-refresh-token',
		expiresIn: 3600,
	}

	const mockLoginResponse = {
		token: mockToken,
		user: {
			id: 1,
			email: 'test@example.com',
		},
	}

	beforeEach(async () => {
		jest.clearAllMocks()
		await AsyncStorage.clear()

		httpClient = require('@/services/http-client').httpClient
		tokenManager = require('@/services/auth/token-manager').tokenManager
		authService = require('@/services/auth/service').authService
	})

	describe('login', () => {
		it('calls httpClient.post with correct credentials', async () => {
			httpClient.post.mockResolvedValueOnce({
				success: true,
				data: mockLoginResponse,
			})
			tokenManager.storeTokens.mockResolvedValueOnce(undefined)

			const credentials = {
				email: 'test@example.com',
				password: 'password123',
			}

			const result = await authService.login(credentials)

			expect(httpClient.post).toHaveBeenCalledWith(
				expect.stringContaining('/authentication/triply/login'),
				{ credentials },
			)
			expect(result).toEqual(mockLoginResponse)
		})

		it('stores tokens on successful login', async () => {
			httpClient.post.mockResolvedValueOnce({
				success: true,
				data: mockLoginResponse,
			})
			tokenManager.storeTokens.mockResolvedValueOnce(undefined)

			await authService.login({
				email: 'test@example.com',
				password: 'password123',
			})

			expect(tokenManager.storeTokens).toHaveBeenCalledWith(mockToken)
		})

		it('throws error on login failure', async () => {
			const error = new Error('Invalid credentials')
			httpClient.post.mockRejectedValueOnce(error)

			await expect(
				authService.login({
					email: 'test@example.com',
					password: 'wrong',
				}),
			).rejects.toThrow('Invalid credentials')
		})
	})

	describe('preRegister', () => {
		it('calls httpClient.post with registration data', async () => {
			const mockResponse = { success: true, otpSent: true }
			httpClient.post.mockResolvedValueOnce({
				success: true,
				data: mockResponse,
			})

			const registerData = {
				email: 'new@example.com',
				password: 'password123',
				firstName: 'Test',
				lastName: 'User',
			}

			const result = await authService.preRegister(registerData)

			expect(httpClient.post).toHaveBeenCalledWith(
				expect.stringContaining('/authentication/triply/pre-register'),
				registerData,
			)
			expect(result).toEqual(mockResponse)
		})

		it('throws error on pre-register failure', async () => {
			const error = new Error('Email already exists')
			httpClient.post.mockRejectedValueOnce(error)

			await expect(
				authService.preRegister({
					email: 'existing@example.com',
					password: 'password123',
					firstName: 'Test',
					lastName: 'User',
				}),
			).rejects.toThrow('Email already exists')
		})
	})

	describe('verifyOtp', () => {
		it('verifies OTP and stores tokens', async () => {
			httpClient.post.mockResolvedValueOnce({
				success: true,
				data: mockLoginResponse,
			})
			tokenManager.storeTokens.mockResolvedValueOnce(undefined)

			const otpData = {
				email: 'test@example.com',
				otp: '123456',
			}

			const result = await authService.verifyOtp(otpData)

			expect(httpClient.post).toHaveBeenCalledWith(
				expect.stringContaining('/authentication/verify-otp'),
				otpData,
			)
			expect(tokenManager.storeTokens).toHaveBeenCalledWith(mockToken)
			expect(result).toEqual(mockLoginResponse)
		})

		it('throws error on invalid OTP', async () => {
			const error = new Error('Invalid OTP')
			httpClient.post.mockRejectedValueOnce(error)

			await expect(
				authService.verifyOtp({
					email: 'test@example.com',
					otp: 'wrong',
				}),
			).rejects.toThrow('Invalid OTP')
		})
	})

	describe('resendOtp', () => {
		it('resends OTP to email', async () => {
			const mockResponse = { success: true, otpSent: true }
			httpClient.post.mockResolvedValueOnce({
				success: true,
				data: mockResponse,
			})

			const result = await authService.resendOtp('test@example.com')

			expect(httpClient.post).toHaveBeenCalledWith(
				expect.stringContaining('/authentication/resend-otp'),
				{ email: 'test@example.com' },
			)
			expect(result).toEqual(mockResponse)
		})

		it('throws error on resend failure', async () => {
			const error = new Error('Too many requests')
			httpClient.post.mockRejectedValueOnce(error)

			await expect(
				authService.resendOtp('test@example.com'),
			).rejects.toThrow('Too many requests')
		})
	})

	describe('isAuthenticated', () => {
		it('returns true when valid token exists', async () => {
			tokenManager.getStoredToken.mockResolvedValueOnce({
				...mockToken,
				expiresIn: 3600,
			})

			const result = await authService.isAuthenticated()
			expect(result).toBe(true)
		})

		it('returns false when no token exists', async () => {
			tokenManager.getStoredToken.mockResolvedValueOnce(null)

			const result = await authService.isAuthenticated()
			expect(result).toBe(false)
		})

		it('returns false on error', async () => {
			tokenManager.getStoredToken.mockRejectedValueOnce(
				new Error('Storage error'),
			)

			const result = await authService.isAuthenticated()
			expect(result).toBe(false)
		})
	})

	describe('logout', () => {
		it('clears tokens on logout', async () => {
			tokenManager.clearTokens.mockResolvedValueOnce(undefined)

			await authService.logout()

			expect(tokenManager.clearTokens).toHaveBeenCalled()
		})

		it('handles clear tokens error gracefully', async () => {
			tokenManager.clearTokens.mockRejectedValueOnce(
				new Error('Storage error'),
			)

			await expect(authService.logout()).rejects.toThrow()
		})
	})

	describe('getAuthHeader', () => {
		it('delegates to tokenManager', async () => {
			const mockHeader = { 'X-Access-Token': 'token' }
			tokenManager.getAuthHeader.mockResolvedValueOnce(mockHeader)

			const result = await authService.getAuthHeader()

			expect(tokenManager.getAuthHeader).toHaveBeenCalled()
			expect(result).toEqual(mockHeader)
		})
	})

	describe('refreshToken', () => {
		it('delegates to tokenManager', async () => {
			tokenManager.refreshToken.mockResolvedValueOnce(true)

			const result = await authService.refreshToken()

			expect(tokenManager.refreshToken).toHaveBeenCalled()
			expect(result).toBe(true)
		})
	})

	describe('handle401Unauthorized', () => {
		it('delegates to tokenManager', async () => {
			tokenManager.handle401Unauthorized.mockResolvedValueOnce(false)

			const result = await authService.handle401Unauthorized()

			expect(tokenManager.handle401Unauthorized).toHaveBeenCalled()
			expect(result).toBe(false)
		})
	})

	describe('getStoredToken', () => {
		it('delegates to tokenManager', async () => {
			tokenManager.getStoredToken.mockResolvedValueOnce(mockToken)

			const result = await authService.getStoredToken()

			expect(tokenManager.getStoredToken).toHaveBeenCalled()
			expect(result).toEqual(mockToken)
		})
	})
})
