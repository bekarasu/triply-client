// Token Manager - handles token operations without circular dependencies
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { API_CONFIG } from '../api-config'
import { LoggerService } from '../logger'
import { RefreshTokenRequest, RefreshTokenResponse, Token } from './types'

// Storage keys
const STORAGE_KEYS = {
	TOKEN: 'auth_token',
	REFRESH_TOKEN: 'refresh_token',
	USER: 'user_data',
}

const ENDPOINTS = {
	REFRESH_TOKEN: `${API_CONFIG.SERVICE_BASE_URL.USER}/authentication/refresh-token`,
}

export class TokenManager {
	private refreshPromise: Promise<boolean> | null = null

	async getStoredToken(): Promise<Token | null> {
		try {
			const tokenData = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN)
			return tokenData ? JSON.parse(tokenData) : null
		} catch (error) {
			LoggerService.log('Error getting stored token:', error)
			return null
		}
	}

	async storeTokens(token: Token): Promise<void> {
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

	async getAuthHeader(): Promise<Record<string, string> | null> {
		try {
			const token = await this.getStoredToken()
			if (!token) return null

			return {
				'X-Access-Token': `${token.accessToken}`,
			}
		} catch (error) {
			LoggerService.log('Error getting auth header:', error)
			return null
		}
	}

	async refreshToken(): Promise<boolean> {
		// If there's already a refresh in progress, return that promise
		if (this.refreshPromise) {
			LoggerService.log(
				'Token refresh already in progress, waiting for existing request',
			)
			return this.refreshPromise
		}

		// Start new refresh process
		this.refreshPromise = this.performTokenRefresh()

		try {
			const result = await this.refreshPromise
			return result
		} finally {
			// Clear the promise after completion (success or failure)
			this.refreshPromise = null
		}
	}

	private async performTokenRefresh(): Promise<boolean> {
		try {
			const storedToken = await this.getStoredToken()
			if (!storedToken?.refreshToken) {
				LoggerService.log('No refresh token available')
				return false
			}

			const refreshRequest: RefreshTokenRequest = {
				refreshToken: storedToken.refreshToken,
			}

			LoggerService.log('Attempting to refresh token')

			const response = await fetch(ENDPOINTS.REFRESH_TOKEN, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(refreshRequest),
			})

			if (!response.ok) {
				LoggerService.log(
					'Token refresh failed with status:',
					response.status,
				)
				return false
			}

			const data = await response.json()
			const refreshResponse: RefreshTokenResponse = data.data

			await this.storeTokens(refreshResponse.token)
			LoggerService.log('Token refreshed successfully')

			return true
		} catch (error) {
			LoggerService.log('Token refresh failed:', error)
			return false
		}
	}

	async clearTokens(): Promise<void> {
		try {
			await AsyncStorage.multiRemove([
				STORAGE_KEYS.TOKEN,
				STORAGE_KEYS.REFRESH_TOKEN,
				STORAGE_KEYS.USER,
			])
		} catch (error) {
			LoggerService.log('Error clearing tokens:', error)
			throw error
		}
	}

	async handle401Unauthorized(): Promise<boolean> {
		try {
			LoggerService.log(
				'Handling 401 unauthorized - attempting token refresh',
			)

			const refreshSuccessful = await this.refreshToken()

			if (refreshSuccessful) {
				LoggerService.log('Token refresh successful')
				return true
			}

			LoggerService.log(
				'Token refresh failed - clearing tokens and redirecting',
			)

			await this.clearTokens()
			router.replace('/login')
			return false
		} catch (error) {
			LoggerService.log('Error handling 401 unauthorized:', error)

			try {
				await this.clearTokens()
				router.replace('/login')
			} catch (fallbackError) {
				LoggerService.log(
					'Error in fallback clear/redirect:',
					fallbackError,
				)
			}
			return false
		}
	}
}

export const tokenManager = new TokenManager()
