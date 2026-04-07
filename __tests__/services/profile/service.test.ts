import AsyncStorage from '@react-native-async-storage/async-storage'

import { authService } from '@/services/auth/service'
import { httpClient } from '@/services/http-client'
import { profileService } from '@/services/profile/service'

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

describe('ProfileService', () => {
	const mockAuthHeader = { 'X-Access-Token': 'test-token' }

	beforeEach(async () => {
		jest.clearAllMocks()
		await AsyncStorage.clear()
		;(authService.getAuthHeader as jest.Mock).mockResolvedValue(
			mockAuthHeader,
		)
	})

	describe('getInfo', () => {
		it('should fetch user profile info', async () => {
			const mockProfile = {
				user: {
					id: 1,
					email: 'test@example.com',
					firstName: 'John',
					lastName: 'Doe',
				},
			}
			;(httpClient.get as jest.Mock).mockResolvedValueOnce({
				data: mockProfile,
			})

			const result = await profileService.getInfo()

			expect(httpClient.get).toHaveBeenCalledWith(
				expect.stringContaining('/profile/me'),
				mockAuthHeader,
			)
			expect(result).toEqual(mockProfile)
		})

		it('should throw when no auth header', async () => {
			;(authService.getAuthHeader as jest.Mock).mockResolvedValueOnce(
				null,
			)

			await expect(profileService.getInfo()).rejects.toThrow(
				'No auth token found',
			)
		})

		it('should throw on error', async () => {
			const error = { message: 'Server error', status: 500 }
			;(httpClient.get as jest.Mock).mockRejectedValueOnce(error)

			await expect(profileService.getInfo()).rejects.toEqual(error)
		})
	})

	describe('storeData', () => {
		it('should store profile data', async () => {
			const profile = {
				id: 1,
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
			}

			await profileService.storeData(profile)

			expect(AsyncStorage.setItem).toHaveBeenCalledWith(
				'profile_data',
				JSON.stringify(profile),
			)
		})

		it('should throw on storage error', async () => {
			const error = new Error('Storage error')
			;(AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error)

			await expect(
				profileService.storeData({ id: 1 } as any),
			).rejects.toThrow('Storage error')
		})
	})

	describe('getStoredData', () => {
		it('should return stored profile', async () => {
			const profile = {
				id: 1,
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
			}
			;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
				JSON.stringify(profile),
			)

			const result = await profileService.getStoredData()

			expect(result).toEqual(profile)
		})

		it('should return null when no profile stored', async () => {
			;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)

			const result = await profileService.getStoredData()

			expect(result).toBeNull()
		})

		it('should return null on storage error', async () => {
			;(AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
				new Error('Storage error'),
			)

			const result = await profileService.getStoredData()

			expect(result).toBeNull()
		})
	})
})
