import { authService } from '@/services/auth/service'
import { isOnboardingCompleted } from '@/utils/onboarding'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from 'react-native'

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
			<SafeAreaView style={styles.container}>
				<View style={styles.content}>
					<View style={styles.logoContainer}>
						<Text style={styles.logo}>✈️</Text>
					</View>
					<Text style={styles.appName}>Triply</Text>
					<ActivityIndicator
						size="large"
						color="#6366f1"
						style={styles.loader}
					/>
					<Text style={styles.loadingText}>
						Preparing your journey...
					</Text>
				</View>
			</SafeAreaView>
		)
	}

	return null
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	logoContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#6366f1',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	logo: {
		fontSize: 48,
	},
	appName: {
		fontSize: 48,
		fontWeight: '800',
		color: '#1f2937',
		marginBottom: 48,
		letterSpacing: -1,
	},
	loader: {
		marginBottom: 20,
	},
	loadingText: {
		fontSize: 18,
		color: '#6b7280',
		fontWeight: '500',
		textAlign: 'center',
	},
})
