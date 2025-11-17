import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_CONFIG } from '../api-config'
import { authService } from '../auth/service'
import { ApiResponse, httpClient } from '../http-client'
import { Logger } from '../logger'
import { GetInfoResponse, Profile } from './types'

const ENDPOINTS = {
	GET_INFO: `${API_CONFIG.SERVICE_BASE_URL.USER}/profile/me`,
}

const STORAGE_KEYS = {
	PROFILE: 'profile_data',
}

class ProfileService {
	async getInfo(): Promise<GetInfoResponse> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')
			const response: ApiResponse<GetInfoResponse> = await httpClient.get(
				ENDPOINTS.GET_INFO,
				authHeader,
			)
			return response.data
		} catch (error) {
			Logger.error('Profile error:', error)
			throw error
		}
	}

	async storeData(profile: Profile): Promise<void> {
		try {
			await AsyncStorage.setItem(
				STORAGE_KEYS.PROFILE,
				JSON.stringify(profile),
			)
		} catch (error) {
			Logger.error('Error storing profile data:', error)
			throw error
		}
	}

	async getStoredData(): Promise<Profile | null> {
		try {
			const profileData = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE)
			return profileData ? JSON.parse(profileData) : null
		} catch (error) {
			Logger.error('Error getting stored profile data:', error)
			return null
		}
	}
}

export const profileService = new ProfileService()
