import { City } from '@/services/city/types'
import { recommendationService } from '@/services/recommendation/service'
import { tripService } from '@/services/trip/service'

import {
	Recommendation,
	RecommendationCriteria,
} from '@/services/recommendation/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

export default function TripDetailsScreen() {
	const [selectedCity, setSelectedCity] = useState<string | null>('')
	const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
		'',
	)
	const [selectedCountryName, setSelectedCountryName] = useState<
		string | null
	>('')
	const [selectedCityId, setSelectedCityId] = useState<string | null>(null)
	const [recommendationCriterias, setRecommendationCriterias] = useState<
		RecommendationCriteria[]
	>([])
	const [selectedRecommendations, setSelectedRecommendations] = useState<
		Recommendation[]
	>([])
	const [additionalCities, setAdditionalCities] = useState<City[]>([])
	const [selectedAdditionalCities, setSelectedAdditionalCities] = useState<
		number[]
	>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isCreatingTrip, setIsCreatingTrip] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true)

				// First, load data from AsyncStorage
				const cityId = await AsyncStorage.getItem('selectedCityId')
				const cityName = await AsyncStorage.getItem('selectedCityName')
				const countryId = await AsyncStorage.getItem(
					'selectedCountryId',
				)
				const countryName = await AsyncStorage.getItem(
					'selectedCountryName',
				)

				if (!countryId || !cityId || !cityName || !countryName) {
					Alert.alert('Error', 'Please go back and select a city.')
					return router.back()
				}

				// Set the state values
				setSelectedCityId(cityId)
				setSelectedCity(cityName)
				setSelectedCountryId(countryId)
				setSelectedCountryName(countryName)

				console.log('-----------------------')

				// Then load the trip data using the retrieved values
				const [criterias, cities] = await Promise.all([
					recommendationService.getRecommendationCriterias(),
					tripService.getAdditionalCities(
						countryId,
						cityId ? [parseInt(cityId)] : [],
					),
				])

				if (criterias == null) {
					return router.back()
				}

				setRecommendationCriterias(criterias)
				setAdditionalCities(cities)
			} catch (error) {
				console.error('Error loading trip data:', error)
				Alert.alert(
					'Error',
					'Failed to load trip data. Please try again.',
				)
			} finally {
				setIsLoading(false)
			}
		}

		loadData()
	}, [router])

	const handleRecommendationToggle = useCallback((criteriaId: number) => {
		setSelectedRecommendations((prev) => {
			const exists = prev.find((r) => r.criteriaId === criteriaId)
			if (exists) {
				// Remove if already selected
				return prev.filter((r) => r.criteriaId !== criteriaId)
			} else {
				// Add with default priority
				return [...prev, { criteriaId, priority: 'medium' }]
			}
		})
	}, [])

	const handleAdditionalCityToggle = useCallback((cityId: number) => {
		setSelectedAdditionalCities((prev) => {
			if (prev.includes(cityId)) {
				return prev.filter((id) => id !== cityId)
			} else {
				return [...prev, cityId]
			}
		})
	}, [])

	const handleCreateTrip = async () => {
		// TODO
		Alert.alert('Creating Trip', 'Work In Progress')
		return
		// /* if (!selectedCityId) {
		// 	Alert.alert(
		// 		'Error',
		// 		'No city selected. Please go back and select a city.',
		// 	)
		// 	return
		// }

		// if (selectedRecommendations.length === 0) {
		// 	Alert.alert(
		// 		'Select Preferences',
		// 		'Please select at least one recommendation criteria.',
		// 	)
		// 	return
		// }

		// try {
		// 	setIsCreatingTrip(true)

		// 	const tripRequest = {
		// 		cityId: parseInt(selectedCityId),
		// 		recommendations: selectedRecommendations,
		// 		additionalCityIds: selectedAdditionalCities,
		// 	}

		// 	const trip = await tripService.createTrip(tripRequest)
		// 	console.log('Trip created:', trip)

		// 	Alert.alert(
		// 		'Trip Created!',
		// 		'Your trip has been successfully created.',
		// 		[
		// 			{
		// 				text: 'OK',
		// 				onPress: () => router.push('/home'),
		// 			},
		// 		],
		// 	)
		// } catch (error) {
		// 	console.error('Error creating trip:', error)
		// 	Alert.alert('Error', 'Failed to create trip. Please try again.')
		// } finally {
		// 	setIsCreatingTrip(false)
		// } */
	}

	const handleBackPress = () => {
		router.back()
	}

	const getCategoryColor = (category: string): string => {
		const colors = {
			budget: '#4CAF50',
			duration: '#2196F3',
			activity: '#FF9800',
			accommodation: '#9C27B0',
			transport: '#607D8B',
		}
		return colors[category as keyof typeof colors] || '#666'
	}

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#007AFF" />
					<Text style={styles.loadingText}>
						Loading trip details...
					</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardAvoid}
			>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={handleBackPress}
					>
						<Text style={styles.backButtonText}>← Back</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Trip Details</Text>
					<View style={styles.placeholder} />
				</View>

				<ScrollView
					style={styles.content}
					showsVerticalScrollIndicator={false}
				>
					{/* Selected City */}
					<View style={styles.selectedCitySection}>
						<Text style={styles.sectionTitle}>Destination</Text>
						<View style={styles.selectedCityCard}>
							<Text style={styles.selectedCityName}>
								{selectedCity}
							</Text>
							<Text style={styles.selectedCityLabel}>
								Primary destination
							</Text>
						</View>
					</View>

					{/* Recommendation Criteria */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Travel Preferences
						</Text>
						<Text style={styles.sectionSubtitle}>
							Select what matters most for your trip
						</Text>
						<View style={styles.criteriaGrid}>
							{recommendationCriterias.map((criteria) => {
								const isSelected = selectedRecommendations.some(
									(r) => r.criteriaId === criteria.id,
								)
								return (
									<TouchableOpacity
										key={criteria.id}
										style={[
											styles.criteriaCard,
											isSelected &&
												styles.criteriaCardSelected,
										]}
										onPress={() =>
											handleRecommendationToggle(
												criteria.id,
											)
										}
									>
										<Text style={styles.criteriaIcon}>
											{criteria.icon}
										</Text>
										<Text
											style={[
												styles.criteriaName,
												isSelected &&
													styles.criteriaNameSelected,
											]}
										>
											{criteria.name}
										</Text>
										<Text
											style={[
												styles.criteriaDescription,
												isSelected &&
													styles.criteriaDescriptionSelected,
											]}
										>
											{criteria.description}
										</Text>
										<View
											style={[
												styles.categoryBadge,
												{
													backgroundColor:
														getCategoryColor(
															criteria.category,
														),
												},
											]}
										>
											<Text style={styles.categoryText}>
												{criteria.category}
											</Text>
										</View>
									</TouchableOpacity>
								)
							})}
						</View>
					</View>

					{/* Additional Cities */}
					{additionalCities.length > 0 && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>
								Add More Cities
							</Text>
							<Text style={styles.sectionSubtitle}>
								Optional: Select additional cities to visit
							</Text>
							<View style={styles.citiesGrid}>
								{additionalCities.map((city) => {
									const isSelected =
										selectedAdditionalCities.includes(
											city.id,
										)
									return (
										<TouchableOpacity
											key={city.id}
											style={[
												styles.additionalCityCard,
												isSelected &&
													styles.additionalCityCardSelected,
											]}
											onPress={() =>
												handleAdditionalCityToggle(
													city.id,
												)
											}
										>
											<Text
												style={[
													styles.additionalCityName,
													isSelected &&
														styles.additionalCityNameSelected,
												]}
											>
												{city.name}
											</Text>
											<Text
												style={[
													styles.additionalCityCountry,
													isSelected &&
														styles.additionalCityCountrySelected,
												]}
											>
												{selectedCountryName}
											</Text>
										</TouchableOpacity>
									)
								})}
							</View>
						</View>
					)}

					{/* Create Trip Button */}
					<TouchableOpacity
						style={[
							styles.createButton,
							(selectedRecommendations.length === 0 ||
								isCreatingTrip) &&
								styles.createButtonDisabled,
						]}
						onPress={handleCreateTrip}
						disabled={
							selectedRecommendations.length === 0 ||
							isCreatingTrip
						}
					>
						{isCreatingTrip ? (
							<>
								<ActivityIndicator size="small" color="#fff" />
								<Text style={styles.createButtonText}>
									Creating Trip...
								</Text>
							</>
						) : (
							<Text style={styles.createButtonText}>
								Create My Trip
							</Text>
						)}
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	keyboardAvoid: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 20,
		paddingTop: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	backButton: {
		padding: 8,
	},
	backButtonText: {
		fontSize: 16,
		color: '#007AFF',
		fontWeight: '600',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	placeholder: {
		width: 60,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: '#666',
	},
	selectedCitySection: {
		marginBottom: 32,
	},
	selectedCityCard: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 12,
		alignItems: 'center',
	},
	selectedCityName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 4,
	},
	selectedCityLabel: {
		fontSize: 14,
		color: 'rgba(255, 255, 255, 0.8)',
	},
	section: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	sectionSubtitle: {
		fontSize: 14,
		color: '#666',
		marginBottom: 16,
	},
	criteriaGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		justifyContent: 'space-between',
	},
	criteriaCard: {
		backgroundColor: '#f8f9fa',
		padding: 8,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#e9ecef',
		position: 'relative',
		width: '32%',
		minHeight: 120,
		maxHeight: 120,
	},
	criteriaCardSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#f0f8ff',
	},
	criteriaIcon: {
		fontSize: 16,
		marginBottom: 8,
	},
	criteriaName: {
		fontSize: 12,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	criteriaNameSelected: {
		color: '#007AFF',
	},
	criteriaDescription: {
		fontSize: 10,
		color: '#666',
		marginBottom: 8,
	},
	criteriaDescriptionSelected: {
		color: '#555',
	},
	categoryBadge: {
		position: 'absolute',
		top: 8,
		right: 8,
		paddingHorizontal: 3,
		paddingVertical: 2,
		borderRadius: 2,
	},
	categoryText: {
		fontSize: 6,
		color: '#fff',
		fontWeight: '600',
		textTransform: 'uppercase',
	},
	citiesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	additionalCityCard: {
		backgroundColor: '#f8f9fa',
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e9ecef',
		minWidth: '45%',
		maxWidth: '45%',
		wordWrap: 'break-word',
	},
	additionalCityCardSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#f0f8ff',
	},
	additionalCityName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		marginBottom: 2,
	},
	additionalCityNameSelected: {
		color: '#007AFF',
	},
	additionalCityCountry: {
		fontSize: 12,
		color: '#666',
	},
	additionalCityCountrySelected: {
		color: '#555',
	},
	createButton: {
		backgroundColor: '#007AFF',
		padding: 16,
		borderRadius: 12,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 40,
	},
	createButtonDisabled: {
		backgroundColor: '#ccc',
	},
	createButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
})
