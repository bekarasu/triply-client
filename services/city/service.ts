import { API_CONFIG } from '../api-config'
import { authService } from '../auth/service'
import { ApiResponse, httpClient } from '../http-client'
import { LoggerService } from '../logger'
import { City, SearchCitiesResponse } from './types'

const ENDPOINTS = {
	POPULAR_CITIES: `${API_CONFIG.SERVICE_BASE_URL.TRAVEL}/cities/popular`,
	SEARCH_CITIES: (query: string) =>
		`${
			API_CONFIG.SERVICE_BASE_URL.TRAVEL
		}/cities/search?q=${encodeURIComponent(query)}&includeCountry=true`,
}

class CityService {
	async getPopularCities(): Promise<City[]> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')
			const response: ApiResponse<City[]> = await httpClient.get(
				ENDPOINTS.POPULAR_CITIES,
				authHeader,
			)
			console.log('Popular cities response:', response.data)
			return response.data
		} catch (error) {
			LoggerService.log('Popular cities error:', error)
			throw error
		}
	}

	async searchCities(query: string): Promise<SearchCitiesResponse> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			const response: ApiResponse<SearchCitiesResponse> =
				await httpClient.get(ENDPOINTS.SEARCH_CITIES(query), authHeader)

			LoggerService.log('Search cities response:', response.data)
			return response.data
		} catch (error) {
			LoggerService.log('Search cities error:', error)
			throw error
		}
	}
}

export const cityService = new CityService()
