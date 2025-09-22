// Authentication Service
import AsyncStorage from '@react-native-async-storage/async-storage'
import { httpClient, ApiResponse } from './http-client'
import { API_CONFIG } from './api-config'
import {
	LoginCredentials,
	LoginResponse,
	PreRegisterRequest,
	PreRegisterResponse,
	VerifyOtpRequest,
	ResendOtpRequest,
	ResendOtpResponse,
	Token,
	User,
} from './auth-types'
import { LoggerService } from './logger'

// Storage keys
const STORAGE_KEYS = {
	TOKEN: 'auth_token',
	REFRESH_TOKEN: 'refresh_token',
	USER: 'user_data',
}

class AuthService {
	// Login
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			const loginRequest = {
				credentials,
			}
			LoggerService.log(API_CONFIG.ENDPOINTS.AUTH.LOGIN('triply'))

			const response: ApiResponse<LoginResponse> = await httpClient.post(
				API_CONFIG.ENDPOINTS.AUTH.LOGIN('triply'),
				loginRequest,
			)

			// Store tokens
			await this.storeTokens(response.data.token)

			return response.data
		} catch (error) {
			LoggerService.log('Login error:', error)
			throw error
		}
	}

	// Pre-register (send OTP)
	async preRegister(
		registerData: PreRegisterRequest,
	): Promise<PreRegisterResponse> {
		try {
			const response: ApiResponse<PreRegisterResponse> =
				await httpClient.post(
					API_CONFIG.ENDPOINTS.AUTH.PRE_REGISTER,
					registerData,
				)

			return response.data
		} catch (error) {
			LoggerService.log('Pre-register error:', error)
			throw error
		}
	}

	// Verify OTP and complete registration
	async verifyOtp(otpData: VerifyOtpRequest): Promise<LoginResponse> {
		try {
			const response: ApiResponse<LoginResponse> = await httpClient.post(
				API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
				otpData,
			)

			// Store tokens after successful verification
			await this.storeTokens(response.data.token)

			return response.data
		} catch (error) {
			LoggerService.log('Verify OTP error:', error)
			throw error
		}
	}

	// Resend OTP
	async resendOtp(email: string): Promise<ResendOtpResponse> {
		try {
			const resendData: ResendOtpRequest = { email }

			const response: ApiResponse<ResendOtpResponse> =
				await httpClient.post(
					API_CONFIG.ENDPOINTS.AUTH.RESEND_OTP,
					resendData,
				)

			return response.data
		} catch (error) {
			LoggerService.log('Resend OTP error:', error)
			throw error
		}
	}

	// Store tokens in AsyncStorage
	private async storeTokens(token: Token): Promise<void> {
		try {
			await AsyncStorage.multiSet([
				[STORAGE_KEYS.TOKEN, JSON.stringify(token)],
				[STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken],
			])
		} catch (error) {
			LoggerService.log('Error storing tokens:', error)
			throw error
		}
	}

	// Get stored token
	async getStoredToken(): Promise<Token | null> {
		try {
			const tokenData = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN)
			return tokenData ? JSON.parse(tokenData) : null
		} catch (error) {
			LoggerService.log('Error getting stored token:', error)
			return null
		}
	}

	// Check if user is authenticated
	async isAuthenticated(): Promise<boolean> {
		try {
			const token = await this.getStoredToken()
			if (!token) return false

			// Check if token is expired
			const now = Date.now() / 1000
			const expirationTime = now + token.expiresIn

			return expirationTime > now
		} catch (error) {
			LoggerService.log('Error checking authentication:', error)
			return false
		}
	}

	// Logout
	async logout(): Promise<void> {
		try {
			await AsyncStorage.multiRemove([
				STORAGE_KEYS.TOKEN,
				STORAGE_KEYS.REFRESH_TOKEN,
				STORAGE_KEYS.USER,
			])
		} catch (error) {
			LoggerService.log('Error during logout:', error)
			throw error
		}
	}

	// Get authorization header
	async getAuthHeader(): Promise<Record<string, string> | null> {
		try {
			const token = await this.getStoredToken()
			if (!token) return null

			return {
				Authorization: `Bearer ${token.accessToken}`,
			}
		} catch (error) {
			LoggerService.log('Error getting auth header:', error)
			return null
		}
	}

	// Store user data
	async storeUserData(user: User): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
		} catch (error) {
			LoggerService.log('Error storing user data:', error)
			throw error
		}
	}

	// Get stored user data
	async getStoredUserData(): Promise<User | null> {
		try {
			const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER)
			return userData ? JSON.parse(userData) : null
		} catch (error) {
			LoggerService.log('Error getting stored user data:', error)
			return null
		}
	}
}

export const authService = new AuthService()
