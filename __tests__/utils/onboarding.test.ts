import {
	isOnboardingCompleted,
	markOnboardingCompleted,
	resetOnboarding,
} from '@/utils/onboarding'
import AsyncStorage from '@react-native-async-storage/async-storage'

// The AsyncStorage mock is set up in jest.setup.js

describe('onboarding utilities', () => {
	beforeEach(async () => {
		await AsyncStorage.clear()
	})

	describe('markOnboardingCompleted', () => {
		it('stores onboarding completed flag in AsyncStorage', async () => {
			await markOnboardingCompleted()
			const value = await AsyncStorage.getItem('onboardingCompleted')
			expect(value).toBe('true')
		})

		it('does not throw when called multiple times', async () => {
			await expect(markOnboardingCompleted()).resolves.not.toThrow()
			await expect(markOnboardingCompleted()).resolves.not.toThrow()
		})

		it('handles AsyncStorage errors gracefully', async () => {
			jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(
				new Error('Storage error'),
			)

			await expect(markOnboardingCompleted()).resolves.not.toThrow()
		})
	})

	describe('isOnboardingCompleted', () => {
		it('returns false when onboarding has not been completed', async () => {
			const result = await isOnboardingCompleted()
			expect(result).toBe(false)
		})

		it('returns true when onboarding has been completed', async () => {
			await markOnboardingCompleted()
			const result = await isOnboardingCompleted()
			expect(result).toBe(true)
		})

		it('returns false when value is not exactly "true"', async () => {
			await AsyncStorage.setItem('onboardingCompleted', 'false')
			const result = await isOnboardingCompleted()
			expect(result).toBe(false)
		})

		it('returns false when AsyncStorage throws an error', async () => {
			const mockError = new Error('AsyncStorage error')
			jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(mockError)

			const result = await isOnboardingCompleted()
			expect(result).toBe(false)
		})
	})

	describe('resetOnboarding', () => {
		it('removes the onboarding completed flag from AsyncStorage', async () => {
			await markOnboardingCompleted()
			await resetOnboarding()
			const value = await AsyncStorage.getItem('onboardingCompleted')
			expect(value).toBeNull()
		})

		it('does not throw when onboarding has not been set', async () => {
			await expect(resetOnboarding()).resolves.not.toThrow()
		})

		it('handles AsyncStorage errors gracefully', async () => {
			const mockError = new Error('AsyncStorage error')
			jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValueOnce(
				mockError,
			)

			await expect(resetOnboarding()).resolves.not.toThrow()
		})
	})
})
