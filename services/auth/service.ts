// Authentication Service
import { API_CONFIG } from '../api-config'
import { ApiResponse, httpClient } from '../http-client'
import { LoggerService } from '../logger'
import { tokenManager } from './token-manager'
import {
	LoginCredentials,
	LoginResponse,
	PreRegisterRequest,
	PreRegisterResponse,
	ResendOtpRequest,
	ResendOtpResponse,
	Token,
	VerifyOtpRequest,
} from './types'

const ENDPOINTS = {
	LOGIN: (provider: string) =>
		`${API_CONFIG.SERVICE_BASE_URL.USER}/authentication/${provider}/login`,
	PRE_REGISTER: `${API_CONFIG.SERVICE_BASE_URL.USER}/authentication/triply/pre-register`,
	VERIFY_OTP: `${API_CONFIG.SERVICE_BASE_URL.USER}/authentication/verify-otp`,
	RESEND_OTP: `${API_CONFIG.SERVICE_BASE_URL.USER}/authentication/resend-otp`,
}

class AuthService {
	// Login
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			const loginRequest = {
				credentials,
			}
			LoggerService.log(ENDPOINTS.LOGIN('triply'))

			const response: ApiResponse<LoginResponse> = await httpClient.post(
				ENDPOINTS.LOGIN('triply'),
				loginRequest,
			)

			console.log('Login response:', response.data.token)

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
				await httpClient.post(ENDPOINTS.PRE_REGISTER, registerData)

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
				ENDPOINTS.VERIFY_OTP,
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
				await httpClient.post(ENDPOINTS.RESEND_OTP, resendData)

			return response.data
		} catch (error) {
			LoggerService.log('Resend OTP error:', error)
			throw error
		}
	}

	// Store tokens using tokenManager
	private async storeTokens(token: Token): Promise<void> {
		return tokenManager.storeTokens(token)
	}

	// Get stored token using tokenManager
	async getStoredToken(): Promise<Token | null> {
		return tokenManager.getStoredToken()
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

	// Logout using tokenManager
	async logout(): Promise<void> {
		return tokenManager.clearTokens()
	}

	// Get authorization header using tokenManager
	async getAuthHeader(): Promise<Record<string, string> | null> {
		return tokenManager.getAuthHeader()
	}

	// Refresh access token using tokenManager
	async refreshToken(): Promise<boolean> {
		return tokenManager.refreshToken()
	}

	// Handle 401 unauthorized using tokenManager
	async handle401Unauthorized(): Promise<boolean> {
		return tokenManager.handle401Unauthorized()
	}
}

export const authService = new AuthService()
