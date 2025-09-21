import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { isOnboardingCompleted } from '@/utils/onboarding'
import { authService } from '@/services/auth-service'

export default function Index() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAppState = async () => {
			try {
				// First check if user is authenticated
				const isAuth = await authService.isAuthenticated()
				if (isAuth) {
					router.replace('/home' as any)
					return
				}

				// If not authenticated, check onboarding status
				const onboardingCompleted = await isOnboardingCompleted()
				if (onboardingCompleted) {
					router.replace('/login' as any)
				} else {
					router.replace('/onboarding-1' as any)
				}
			} catch (error) {
				console.error('Error checking app state:', error)
				router.replace('/onboarding-1' as any)
			} finally {
				setIsLoading(false)
			}
		}

		checkAppState()
	}, [router])

	if (isLoading) {
		return (
			<View style={styles.container}>
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		)
	}

	return null
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	loadingText: {
		fontSize: 16,
		color: '#666',
	},
})
