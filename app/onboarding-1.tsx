import { Logger } from '@/services/logger'
import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { markOnboardingCompleted } from '@/utils/onboarding'
import { LoggerService } from '@/services/logger'

const { width } = Dimensions.get('window')

export default function OnboardingOne() {
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
						<Text style={styles.placeholderText}>🗺️</Text>
					</View>
				</View>

				<View style={styles.textContainer}>
					<Text style={styles.title}>Discover Amazing Places</Text>
					<Text style={styles.description}>
						Explore thousands of beautiful destinations around the
						world and find your next adventure
					</Text>
				</View>

				<View style={styles.bottomContainer}>
					<View style={styles.pagination}>
						<View style={[styles.dot, styles.activeDot]} />
						<View style={styles.dot} />
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
								router.replace('/onboarding-2' as any)
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
		backgroundColor: '#fff',
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
		width: width * 0.6,
		height: width * 0.6,
		backgroundColor: '#f0f8ff',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#007AFF',
		borderStyle: 'dashed',
	},
	placeholderText: {
		fontSize: 80,
	},
	textContainer: {
		flex: 0.3,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#333',
		textAlign: 'center',
		marginBottom: 16,
	},
	description: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		lineHeight: 24,
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
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#ddd',
		marginHorizontal: 5,
	},
	activeDot: {
		backgroundColor: '#007AFF',
		width: 24,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	skipButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
	},
	skipText: {
		fontSize: 16,
		color: '#666',
	},
	nextButton: {
		backgroundColor: '#007AFF',
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 25,
	},
	nextText: {
		fontSize: 16,
		color: '#fff',
		fontWeight: '600',
	},
})
