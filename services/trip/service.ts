import { API_CONFIG } from '../api-config'
import { authService } from '../auth/service'
import { City } from '../city/types'
import { ApiResponse, httpClient } from '../http-client'
import { Logger } from '../logger'
import { CreateTripRequest, MyTrip, TripDetails, TripOverview } from './types'

const ENDPOINTS = {
	ADDITIONAL_CITIES: `${API_CONFIG.SERVICE_BASE_URL.TRAVEL}/cities/country/:id`,
	CREATE_TRIP: `${API_CONFIG.SERVICE_BASE_URL.TRAVEL}/trips`,
	TRIPS_OVERVIEW: `${API_CONFIG.SERVICE_BASE_URL.TRAVEL}/trips/upcoming`,
	TRIP_DETAILS: `${API_CONFIG.SERVICE_BASE_URL.TRAVEL}/trips/:tripId`,
	MY_TRIPS: `${API_CONFIG.SERVICE_BASE_URL.TRAVEL}/trips`,
}

class TripService {
	async getAdditionalCities(
		countryId: string,
		excludeList: number[],
	): Promise<City[]> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			if (
				!countryId ||
				countryId === 'undefined' ||
				countryId === 'null'
			) {
				Logger.error('Invalid countryId provided, returning mock data')
				return []
			}

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
			Logger.error('Additional cities error:', error)
			return []
		}
	}

	async createTrip(
		request: CreateTripRequest,
		signal?: AbortSignal,
	): Promise<TripDetails> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			console.log({ request: JSON.stringify(request) })

			const response: ApiResponse<TripDetails> = await httpClient.post(
				ENDPOINTS.CREATE_TRIP,
				request,
				authHeader,
				300 * 1000, // 5 minutes timeout
				signal,
			)

			return response.data
		} catch (error) {
			Logger.error('Create trip error:', error)
			throw error
		}
	}

	async getTripsOverview(): Promise<TripOverview[]> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			const response: ApiResponse<TripOverview[]> = await httpClient.get(
				ENDPOINTS.TRIPS_OVERVIEW,
				authHeader,
			)

			return response.data
		} catch (error) {
			Logger.error('Get trips overview error:', error)
			throw error
		}
	}

	async getTripById(tripId: string): Promise<TripDetails> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			const url = ENDPOINTS.TRIP_DETAILS.replace(':tripId', tripId)
			const response: ApiResponse<TripDetails> = await httpClient.get(
				url,
				authHeader,
			)

			return response.data
		} catch (error) {
			Logger.error('Get trip details error:', error)
			throw error
		}
	}

	async getMyTrips(): Promise<MyTrip[]> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			const response: ApiResponse<MyTrip[]> = await httpClient.get(
				ENDPOINTS.MY_TRIPS,
				authHeader,
			)

			return response.data
		} catch (error) {
			Logger.error('Get my trips error:', error)
			throw error
		}
	}
}

export const tripService = new TripService()
