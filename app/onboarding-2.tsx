import React from 'react'
import { useRouter } from 'expo-router'
import { Logger } from '@/services/logger'
import { markOnboardingCompleted } from '@/utils/onboarding'
import {
	Dimensions,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

const { width } = Dimensions.get('window')

export default function OnboardingTwo() {
	const router = useRouter()

	const handleSkip = async () => {
		try {
			await markOnboardingCompleted()
			router.replace('/login' as any)
		} catch (error) {
			Logger.error('Error completing onboarding:', error)
			router.replace('/login' as any)
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<View style={styles.imageContainer}>
					<View style={styles.placeholder}>
						<Text style={styles.placeholderText}>✈️</Text>
					</View>
				</View>

				<View style={styles.textContainer}>
					<Text style={styles.title}>Plan Your Perfect Trip</Text>
					<Text style={styles.description}>
						Create detailed itineraries with our smart planning
						tools and never miss a moment of your journey
					</Text>
				</View>

				<View style={styles.bottomContainer}>
					<View style={styles.pagination}>
						<View style={styles.dot} />
						<View style={[styles.dot, styles.activeDot]} />
						<View style={styles.dot} />
					</View>

					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={styles.skipButton}
							onPress={handleSkip}
						>
							<Text style={styles.skipText}>Skip</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.nextButton}
							onPress={() =>
								router.replace('/onboarding-3' as any)
							}
						>
							<Text style={styles.nextText}>Next</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	imageContainer: {
		flex: 0.5,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 60,
	},
	placeholder: {
		width: width * 0.7,
		height: width * 0.7,
		backgroundColor: '#fff',
		borderRadius: 32,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 8,
		borderWidth: 3,
		borderColor: '#e0e7ff',
	},
	placeholderText: {
		fontSize: 120,
	},
	textContainer: {
		flex: 0.3,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: '800',
		color: '#1f2937',
		textAlign: 'center',
		marginBottom: 20,
		letterSpacing: -0.5,
	},
	description: {
		fontSize: 18,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 28,
		paddingHorizontal: 12,
	},
	bottomContainer: {
		flex: 0.2,
		justifyContent: 'space-between',
		paddingBottom: 40,
	},
	pagination: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	dot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: '#d1d5db',
		marginHorizontal: 6,
	},
	activeDot: {
		backgroundColor: '#6366f1',
		width: 32,
		height: 12,
		borderRadius: 6,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	skipButton: {
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 16,
		backgroundColor: '#f1f5f9',
	},
	skipText: {
		fontSize: 16,
		color: '#6b7280',
		fontWeight: '600',
	},
	nextButton: {
		backgroundColor: '#6366f1',
		paddingVertical: 16,
		paddingHorizontal: 40,
		borderRadius: 16,
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	nextText: {
		fontSize: 16,
		color: '#fff',
		fontWeight: '700',
	},
})
