// Mock the http client
jest.mock('@/services/http-client', () => ({
	httpClient: {
		get: jest.fn(),
		post: jest.fn(),
	},
}))

// Mock auth service
jest.mock('@/services/auth/service', () => ({
	authService: {
		getAuthHeader: jest.fn(),
	},
}))

describe('TripService', () => {
	let tripService: any
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

	const mockTripDetails = {
		id: '1',
		name: 'European Adventure',
		startDate: '2024-06-15',
		endDate: '2024-06-25',
		days: [],
	}

	const mockTripOverview = {
		id: '1',
		name: 'European Adventure',
		startDate: '2024-06-15',
		endDate: '2024-06-25',
	}

	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()

		httpClient = require('@/services/http-client').httpClient
		authService = require('@/services/auth/service').authService
		tripService = require('@/services/trip/service').tripService
	})

	describe('getAdditionalCities', () => {
		it('returns additional cities for a country', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: [mockCity],
			})

			const result = await tripService.getAdditionalCities('1', [])

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('/cities/country/1'),
				mockAuthHeader,
			)
			expect(result).toEqual([mockCity])
		})

		it('includes exclude list in query params', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: [mockCity],
			})

			await tripService.getAdditionalCities('1', [5, 10])

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('excludeList=5%2C10'),
				mockAuthHeader,
			)
		})

		it('returns empty array for invalid countryId', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)

			const result = await tripService.getAdditionalCities('undefined', [])

			expect(result).toEqual([])
			expect(httpClient.get).not.toHaveBeenCalled()
		})

		it('returns empty array for null countryId', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)

			const result = await tripService.getAdditionalCities('null', [])

			expect(result).toEqual([])
		})

		it('returns empty array on API error', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockRejectedValueOnce(new Error('Network error'))

			const result = await tripService.getAdditionalCities('1', [])

			expect(result).toEqual([])
		})

		it('throws error when no auth token', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(null)

			const result = await tripService.getAdditionalCities('1', [])

			expect(result).toEqual([])
		})

		it('returns empty array when response.data is undefined', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: undefined,
			})

			const result = await tripService.getAdditionalCities('1', [])

			expect(result).toEqual([])
		})

		it('validates city data and adds default country if missing', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			const cityWithoutCountry = { id: 1, name: 'Paris' }
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: [cityWithoutCountry],
			})

			const result = await tripService.getAdditionalCities('1', [])

			expect(result[0].country).toEqual({
				id: 0,
				name: 'Unknown Country',
				iso2: 'UN',
			})
		})
	})

	describe('createTrip', () => {
		it('creates a trip successfully', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.post.mockResolvedValueOnce({
				success: true,
				data: mockTripDetails,
			})

			const createRequest = {
				cities: [{ cityId: 1, duration: 5 }],
				startDate: '2024-06-15',
			}

			const result = await tripService.createTrip(createRequest)

			expect(httpClient.post).toHaveBeenCalledWith(
				expect.stringContaining('/trips'),
				createRequest,
				mockAuthHeader,
				300 * 1000, // 5 minute timeout
				undefined,
			)
			expect(result).toEqual(mockTripDetails)
		})

		it('passes abort signal when provided', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.post.mockResolvedValueOnce({
				success: true,
				data: mockTripDetails,
			})

			const controller = new AbortController()
			const createRequest = { cities: [], startDate: '2024-06-15' }

			await tripService.createTrip(createRequest, controller.signal)

			expect(httpClient.post).toHaveBeenCalledWith(
				expect.any(String),
				createRequest,
				mockAuthHeader,
				300 * 1000,
				controller.signal,
			)
		})

		it('throws error when no auth token', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(null)

			await expect(
				tripService.createTrip({ cities: [], startDate: '2024-06-15' }),
			).rejects.toThrow('No auth token found')
		})

		it('throws error on API failure', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.post.mockRejectedValueOnce(new Error('Create failed'))

			await expect(
				tripService.createTrip({ cities: [], startDate: '2024-06-15' }),
			).rejects.toThrow('Create failed')
		})
	})

	describe('getTripsOverview', () => {
		it('returns trips overview', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: [mockTripOverview],
			})

			const result = await tripService.getTripsOverview()

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('/trips/upcoming'),
				mockAuthHeader,
			)
			expect(result).toEqual([mockTripOverview])
		})

		it('throws error when no auth token', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(null)

			await expect(tripService.getTripsOverview()).rejects.toThrow(
				'No auth token found',
			)
		})

		it('throws error on API failure', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockRejectedValueOnce(new Error('Fetch failed'))

			await expect(tripService.getTripsOverview()).rejects.toThrow(
				'Fetch failed',
			)
		})
	})

	describe('getTripById', () => {
		it('returns trip details by id', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: mockTripDetails,
			})

			const result = await tripService.getTripById('1')

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('/trips/1'),
				mockAuthHeader,
			)
			expect(result).toEqual(mockTripDetails)
		})

		it('throws error when no auth token', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(null)

			await expect(tripService.getTripById('1')).rejects.toThrow(
				'No auth token found',
			)
		})

		it('throws error on API failure', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockRejectedValueOnce(new Error('Not found'))

			await expect(tripService.getTripById('999')).rejects.toThrow(
				'Not found',
			)
		})
	})

	describe('getMyTrips', () => {
		it('returns user trips', async () => {
			const mockTrips = [
				{ id: '1', name: 'Trip 1' },
				{ id: '2', name: 'Trip 2' },
			]
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockResolvedValueOnce({
				success: true,
				data: mockTrips,
			})

			const result = await tripService.getMyTrips()

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('/trips'),
				mockAuthHeader,
			)
			expect(result).toEqual(mockTrips)
		})

		it('throws error when no auth token', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(null)

			await expect(tripService.getMyTrips()).rejects.toThrow(
				'No auth token found',
			)
		})

		it('throws error on API failure', async () => {
			authService.getAuthHeader.mockResolvedValueOnce(mockAuthHeader)
			httpClient.get.mockRejectedValueOnce(new Error('Fetch failed'))

			await expect(tripService.getMyTrips()).rejects.toThrow('Fetch failed')
		})
	})
})
