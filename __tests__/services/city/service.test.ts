// Mock the http client
jest.mock('@/services/http-client', () => ({
	httpClient: {
		get: jest.fn(),
	},
}))

// Mock auth service
jest.mock('@/services/auth/service', () => ({
	authService: {
		getAuthHeader: jest.fn(),
	},
}))

describe('CityService', () => {
	let cityService: any
	let httpClient: any
	let authService: any

	const mockAuthHeader = { 'X-Access-Token': 'test-token' }

	const mockCity = {
		id: 1,
		name: 'Paris',
		country: { id: 1, name: 'France', iso2: 'FR' },
		latitude: 48.8566,
		longitude: 2.3522,
	}

	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()

		httpClient = require('@/services/http-client').httpClient
		authService = require('@/services/auth/service').authService
		cityService = require('@/services/city/service').cityService
	})

	describe('getPopularCities', () => {
		it('returns popular cities on success', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: [mockCity],
			})

			const result = await cityService.getPopularCities()

			expect(authService.getAuthHeader).toHaveBeenCalled()
			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('/cities/popular'),
				mockAuthHeader,
			)
			expect(result).toEqual([mockCity])
		})

		it('throws error when no auth token', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(null)

			await expect(cityService.getPopularCities()).rejects.toThrow(
				'No auth token found',
			)
		})

		it('throws error on API failure', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockRejectedValueOnce(new Error('Network error'))

			await expect(cityService.getPopularCities()).rejects.toThrow(
				'Network error',
			)
		})
	})

	describe('searchCities', () => {
		it('returns search results', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: { cities: [mockCity], total: 1 },
			})

			const result = await cityService.searchCities('Paris')

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('/cities/search?q=Paris'),
				mockAuthHeader,
			)
			expect(result).toEqual({ cities: [mockCity], total: 1 })
		})

		it('encodes special characters in query', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: { cities: [], total: 0 },
			})

			await cityService.searchCities('New York')

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('q=New%20York'),
				mockAuthHeader,
			)
		})

		it('throws error when no auth token', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(null)

			await expect(cityService.searchCities('Paris')).rejects.toThrow(
				'No auth token found',
			)
		})

		it('throws error on API failure', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockRejectedValueOnce(new Error('Search failed'))

			await expect(cityService.searchCities('Paris')).rejects.toThrow(
				'Search failed',
			)
		})
	})
})
