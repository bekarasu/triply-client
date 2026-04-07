// Mock react-native Alert
jest.mock('react-native', () => ({
	Alert: {
		alert: jest.fn(),
	},
}))

// Mock the dependencies before importing the service
jest.mock('@/services/http-client', () => ({
	httpClient: {
		get: jest.fn(),
		post: jest.fn(),
		put: jest.fn(),
		delete: jest.fn(),
	},
}))

jest.mock('@/services/auth/service', () => ({
	authService: {
		getAuthHeader: jest.fn(),
	},
}))

jest.mock('@/services/logger', () => ({
	Logger: {
		log: jest.fn(),
		error: jest.fn(),
	},
}))

import { authService } from '@/services/auth/service'
import { httpClient } from '@/services/http-client'
import { recommendationService } from '@/services/recommendation/service'
import { Alert } from 'react-native'

describe('RecommendationService', () => {
	const mockAuthHeader = { 'X-Access-Token': 'test-token' }

	beforeEach(() => {
		jest.clearAllMocks()
		;(authService.getAuthHeader as jest.Mock).mockResolvedValue(
			mockAuthHeader,
		)
	})

	describe('getRecommendationCriterias', () => {
		it('should fetch recommendation criterias', async () => {
			const mockCriterias = [
				{ id: 1, name: 'Adventure', icon: 'mountain' },
				{ id: 2, name: 'Culture', icon: 'museum' },
				{ id: 3, name: 'Relaxation', icon: 'spa' },
			]
			;(httpClient.get as jest.Mock).mockResolvedValueOnce({
				data: mockCriterias,
			})

			const result =
				await recommendationService.getRecommendationCriterias()

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('/criterias'),
				mockAuthHeader,
			)
			expect(result).toEqual(mockCriterias)
		})

		it('should return empty array when response data is null', async () => {
			;(httpClient.get as jest.Mock).mockResolvedValueOnce({ data: null })

			const result =
				await recommendationService.getRecommendationCriterias()

			expect(result).toEqual([])
		})

		it('should return empty array when no auth header', async () => {
			;(authService.getAuthHeader as jest.Mock).mockResolvedValueOnce(
				null,
			)

			const result =
				await recommendationService.getRecommendationCriterias()

			expect(result).toEqual([])
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				'Failed to fetch recommendation criterias.',
			)
		})

		it('should return empty array and show alert on error', async () => {
			const error = { message: 'Server error', status: 500 }
			;(httpClient.get as jest.Mock).mockRejectedValueOnce(error)

			const result =
				await recommendationService.getRecommendationCriterias()

			expect(result).toEqual([])
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				'Failed to fetch recommendation criterias.',
			)
		})
	})
})
