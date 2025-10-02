import { API_CONFIG } from '../api-config'
import { authService } from '../auth/service'
import { City } from '../city/types'
import { ApiResponse, httpClient } from '../http-client'
import { LoggerService } from '../logger'
import { CreateTripRequest, Trip } from './types'

const ENDPOINTS = {
	ADDITIONAL_CITIES: `${API_CONFIG.SERVICE_BASE_URL.TRAVEL}/cities/country/:id`,
	CREATE_TRIP: `${API_CONFIG.SERVICE_BASE_URL.TRAVEL}/trips`,
}

class TripService {
	async getAdditionalCities(
		countryId: string,
		excludeList: number[],
	): Promise<City[]> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			// Validate countryId
			if (
				!countryId ||
				countryId === 'undefined' ||
				countryId === 'null'
			) {
				LoggerService.log(
					'Invalid countryId provided, returning mock data',
				)
				return []
			}

			// Construct URL with proper query parameters
			const baseUrl = ENDPOINTS.ADDITIONAL_CITIES.replace(
				':id',
				countryId,
			)
			const queryParams = new URLSearchParams()

			if (excludeList && excludeList.length > 0) {
				queryParams.append('excludeList', excludeList.join(','))
			}
			queryParams.append('capital', 'primary,admin')

			const fullUrl = `${baseUrl}?${queryParams.toString()}`

			const response: ApiResponse<City[]> = await httpClient.get(
				fullUrl,
				authHeader,
			)

			// Validate response data and ensure each city has proper structure
			const cities = response.data || []
			const validCities = cities.map((city) => ({
				...city,
				country: city.country || {
					id: 0,
					name: 'Unknown Country',
					iso2: 'UN',
				},
			}))

			return validCities
		} catch (error) {
			LoggerService.log('Additional cities error:', error)
			return []
		}
	}

	async createTrip(request: CreateTripRequest): Promise<Trip> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			const response: ApiResponse<Trip> = await httpClient.post(
				ENDPOINTS.CREATE_TRIP,
				request,
				authHeader,
			)

			LoggerService.log('Create trip response:', response.data)
			return response.data
		} catch (error) {
			LoggerService.log('Create trip error:', error)
			throw error
		}
	}
}

export const tripService = new TripService()
