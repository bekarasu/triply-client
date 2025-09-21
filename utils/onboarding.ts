import AsyncStorage from '@react-native-async-storage/async-storage'

const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted'

export const markOnboardingCompleted = async (): Promise<void> => {
	try {
		await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true')
	} catch (error) {
		console.error('Error saving onboarding state:', error)
	}
}

export const isOnboardingCompleted = async (): Promise<boolean> => {
	try {
		const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)
		return value === 'true'
	} catch (error) {
		console.error('Error reading onboarding state:', error)
		return false
	}
}

export const resetOnboarding = async (): Promise<void> => {
	try {
		await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY)
	} catch (error) {
		console.error('Error resetting onboarding state:', error)
	}
}
