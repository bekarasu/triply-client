import { Logger } from '@/services/logger'
import { formatDateOnly } from '@/utils/date'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useTripContext } from '../contexts/TripContext'
import { tripService } from '../services/trip/service'

const loadingSteps = [
	{
		icon: '✈️',
		title: 'Planning your journey',
		description: 'Finding the best routes for you',
	},
	{
		icon: '🗺️',
		title: 'Exploring destinations',
		description: 'Discovering amazing places',
	},
	{
		icon: '🏨',
		title: 'Selecting accommodations',
		description: 'Finding perfect stays',
	},
	{
		icon: '🎯',
		title: 'Personalizing your trip',
		description: 'Matching your preferences',
	},
	{
		icon: '✨',
		title: 'Finalizing details',
		description: 'Almost ready!',
	},
]

export default function TripLoadingScreen() {
	const [currentStep, setCurrentStep] = useState(0)
	const [fadeAnim] = useState(new Animated.Value(0))
	const abortControllerRef = useRef<AbortController | null>(null)
	const router = useRouter()
	const { selectedCities, tripStartDate, setTripDetails } = useTripContext()
	const [requestAborted, setRequestAborted] = useState(false)

	const handleCancel = () => {
		Alert.alert(
			'Cancel Trip Creation',
			'Are you sure you want to cancel? Your progress will be lost.',
			[
				{
					text: 'Continue',
					style: 'cancel',
				},
				{
					text: 'Cancel Trip',
					style: 'destructive',
					onPress: () => {
						// Abort the ongoing request
						if (abortControllerRef.current) {
							abortControllerRef.current.abort()
							setRequestAborted(true)
						}
						router.back()
					},
				},
			],
		)
	}

	// Handle trip creation
	useEffect(() => {
		abortControllerRef.current = new AbortController()

		const createTrip = async () => {
			try {
				const response = await tripService.createTrip(
					{
						startDate: formatDateOnly(tripStartDate),
						destinations: selectedCities.map((sc) => ({
							cityId: sc.city.id,
							budget: sc.data.budget,
							duration: sc.data.duration,
							criteriaIds: sc.data.criterias.map((c) => c.id),
						})),
					},
					abortControllerRef.current?.signal,
				)

				Logger.log('Trip created successfully:', response)

				setTripDetails(response)

				setTimeout(() => {
					Logger.log('Navigating to trip details')
					router.replace('/trip-details')
				}, 2000)
			} catch (error: any) {
				if (error.name === 'AbortError') {
					Logger.log('Trip creation cancelled')
					return
				}

				if (requestAborted) {
					Logger.log('Request was aborted, not showing error alert')
					return
				}

				Logger.error('Error creating trip:', error)
				Alert.alert(
					'Error',
					'Failed to create trip. Please try again.',
					[
						{
							text: 'OK',
							onPress: () => router.back(),
						},
					],
				)
			}
		}

		createTrip()

		return () => {
			// Clean up on unmount
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [selectedCities, tripStartDate, router, setTripDetails])

	useEffect(() => {
		// Fade in animation
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 500,
			useNativeDriver: true,
		}).start()

		// Change step every 5 seconds
		const interval = setInterval(() => {
			setCurrentStep((prev) => {
				if (prev < loadingSteps.length - 1) {
					return prev + 1
				}
				return prev
			})
		}, 15 * 1000)

		return () => clearInterval(interval)
	}, [fadeAnim])

	useEffect(() => {
		// Fade in/out animation when step changes
		Animated.sequence([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start()
	}, [currentStep, fadeAnim])

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				{/* Cancel button */}
				<TouchableOpacity
					style={styles.cancelButton}
					onPress={handleCancel}
				>
					<Text style={styles.cancelButtonText}>Cancel</Text>
				</TouchableOpacity>

				{/* Progress indicator */}
				<View style={styles.progressContainer}>
					{loadingSteps.map((_, index) => (
						<View
							key={index}
							style={[
								styles.progressDot,
								index <= currentStep &&
									styles.progressDotActive,
							]}
						/>
					))}
				</View>

				{/* Animated content */}
				<Animated.View
					style={[styles.animatedContent, { opacity: fadeAnim }]}
				>
					<Text style={styles.icon}>
						{loadingSteps[currentStep].icon}
					</Text>
					<Text style={styles.title}>
						{loadingSteps[currentStep].title}
					</Text>
					<Text style={styles.description}>
						{loadingSteps[currentStep].description}
					</Text>
				</Animated.View>

				{/* Loading spinner */}
				<View style={styles.spinnerContainer}>
					<ActivityIndicator size="large" color="#6366f1" />
				</View>

				{/* Bottom text */}
				<Text style={styles.bottomText}>
					This may take a few moments...
				</Text>
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
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
	},
	progressContainer: {
		flexDirection: 'row',
		marginBottom: 60,
		gap: 8,
	},
	progressDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#e5e7eb',
	},
	progressDotActive: {
		backgroundColor: '#6366f1',
	},
	animatedContent: {
		alignItems: 'center',
		marginBottom: 60,
	},
	icon: {
		fontSize: 80,
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 12,
		textAlign: 'center',
	},
	description: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 24,
	},
	spinnerContainer: {
		marginBottom: 40,
	},
	bottomText: {
		fontSize: 14,
		color: '#9ca3af',
		textAlign: 'center',
	},
	cancelButton: {
		position: 'absolute',
		top: 20,
		right: 20,
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: '#fff',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 3,
	},
	cancelButtonText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6b7280',
	},
})
