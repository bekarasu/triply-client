// Authentication Service
import { API_CONFIG } from '../api-config'
import { ApiResponse, httpClient } from '../http-client'
import { Logger } from '../logger'
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
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			const loginRequest = {
				credentials,
			}

			const response: ApiResponse<LoginResponse> = await httpClient.post(
				ENDPOINTS.LOGIN('triply'),
				loginRequest,
			)

			// Store tokens
			await this.storeTokens(response.data.token)

			return response.data
		} catch (error) {
			Logger.error('Login error:', error)
			throw error
		}
	}

	async preRegister(
		registerData: PreRegisterRequest,
	): Promise<PreRegisterResponse> {
		try {
			const response: ApiResponse<PreRegisterResponse> =
				await httpClient.post(ENDPOINTS.PRE_REGISTER, registerData)

			return response.data
		} catch (error) {
			Logger.error('Pre-register error:', error)
			throw error
		}
	}

	async verifyOtp(otpData: VerifyOtpRequest): Promise<LoginResponse> {
		try {
			const response: ApiResponse<LoginResponse> = await httpClient.post(
				ENDPOINTS.VERIFY_OTP,
				otpData,
			)

			await this.storeTokens(response.data.token)

			return response.data
		} catch (error) {
			Logger.error('Verify OTP error:', error)
			throw error
		}
	}

	async resendOtp(email: string): Promise<ResendOtpResponse> {
		try {
			const resendData: ResendOtpRequest = { email }

			const response: ApiResponse<ResendOtpResponse> =
				await httpClient.post(ENDPOINTS.RESEND_OTP, resendData)

			return response.data
		} catch (error) {
			Logger.error('Resend OTP error:', error)
			throw error
		}
	}

	private async storeTokens(token: Token): Promise<void> {
		return tokenManager.storeTokens(token)
	}

	async getStoredToken(): Promise<Token | null> {
		return tokenManager.getStoredToken()
	}

	async isAuthenticated(): Promise<boolean> {
		try {
			const token = await this.getStoredToken()
			if (!token) return false

			const now = Date.now() / 1000
			const expirationTime = now + token.expiresIn

			return expirationTime > now
		} catch (error) {
			Logger.error('Error checking authentication:', error)
			return false
		}
	}

	async logout(): Promise<void> {
		try {
			// Clear trip data from memory
			const { clearTripDataGlobally } = await import(
				'../../contexts/TripContext'
			)
			clearTripDataGlobally()
		} catch (error) {
			Logger.error('Error clearing trip data on logout:', error)
		}

		return tokenManager.clearTokens()
	}

	async getAuthHeader(): Promise<Record<string, string> | null> {
		return tokenManager.getAuthHeader()
	}

	async refreshToken(): Promise<boolean> {
		return tokenManager.refreshToken()
	}

	async handle401Unauthorized(): Promise<boolean> {
		return tokenManager.handle401Unauthorized()
	}
}

export const authService = new AuthService()
