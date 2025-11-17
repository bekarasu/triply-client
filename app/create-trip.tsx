import { cityService } from '@/services/city/service'
import { recommendationService } from '@/services/recommendation/service'
import { Criteria } from '@/services/recommendation/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
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
import CriteriaModal from '../components/CriteriaModal'
import DestinationSearch from '../components/create-trip/DestinationSearch'
import CreateTripPlanOverview from '../components/create-trip/PlanOverview'
import PopularCities from '../components/create-trip/PopularCity'
import { CityWithCriteria, useTripContext } from '../contexts/TripContext'
import { City } from '../services/city/types'
import { Logger } from '@/services/logger'

interface CriteriaModalState {
	visible: boolean
	city: City | null
}

export default function CreateTripScreen() {
	const {
		selectedCities,
		tripStartDate,
		setTripStartDate,
		addCity,
		removeCity,
		reorderCities,
	} = useTripContext()

	const [searchQuery, setSearchQuery] = useState('')
	const [popularCities, setPopularCities] = useState<City[]>([])
	const [searchResults, setSearchResults] = useState<City[]>([])
	const [recommendationCriterias, setRecommendationCriterias] = useState<
		Criteria[]
	>([])
	const [criteriaModal, setCriteriaModal] = useState<CriteriaModalState>({
		visible: false,
		city: null,
	})
	const [isSearching, setIsSearching] = useState(false)
	const [hasSearched, setHasSearched] = useState(false)
	const [tripDuration, setTripDuration] = useState<number | null>(0)
	const router = useRouter()

	const handleSearch = useCallback(async () => {
		if (searchQuery.trim()) {
			setIsSearching(true)
			setHasSearched(true)
			try {
				const response = await cityService.searchCities(
					searchQuery.trim(),
				)
				setSearchResults(response.cities)
			} catch (error) {
				console.error('Error searching cities:', error)
				setSearchResults([])
			} finally {
				setIsSearching(false)
			}
		}
	}, [searchQuery])

	useEffect(() => {
		loadPopularCities()
		loadActivityOptions()
	}, [])

	const loadActivityOptions = async () => {
		try {
			const criterias =
				await recommendationService.getRecommendationCriterias()

			setRecommendationCriterias(criterias)
		} catch (error) {
			Logger.error('Error loading activity options:', error)
			// Fallback to empty array or default activities
			setRecommendationCriterias([])
		}
	}

	useEffect(() => {
		const delayedSearch = setTimeout(() => {
			if (searchQuery.trim() && searchQuery.length > 2) {
				handleSearch()
			} else if (searchQuery.length === 0) {
				setSearchResults([])
				setHasSearched(false)
			}
		}, 500)

		return () => clearTimeout(delayedSearch)
	}, [searchQuery, handleSearch])

	const loadPopularCities = async () => {
		try {
			const cities = await cityService.getPopularCities()
			setPopularCities(cities)
		} catch (error) {
			console.error('Error loading popular cities:', error)
		}
	}

	const handleCitySelect = (city: City) => {
		const isAlreadySelected = selectedCities.some(
			(sc) => sc.city.id === city.id,
		)

		if (isAlreadySelected) {
			// Remove city from selection
			removeCity(city.id)
		} else {
			// Open criteria modal for new city
			setCriteriaModal({ visible: true, city })
		}
	}

	const handleCitiesReorder = (reorderedCities: CityWithCriteria[]) => {
		reorderCities(reorderedCities)
	}

	const addCityWithCriteria = (
		city: City,
		data: {
			budget: string
			duration: string
			criterias: Criteria[]
		},
	) => {
		const newCityWithCriteria: CityWithCriteria = {
			city,
			data,
		}
		addCity(newCityWithCriteria)
		setCriteriaModal({ visible: false, city: null })
		setSearchResults([])
		setSearchQuery('')
		setTripDuration(Number.parseInt(data.duration))
	}

	const handleFinalizeTripSelection = async () => {
		if (!tripStartDate) {
			Alert.alert(
				'Missing Information',
				'Please select your trip start date.',
			)
			return
		}

		if (selectedCities.length === 0) {
			Alert.alert(
				'No Cities Selected',
				'Please select at least one city for your trip.',
			)
			return
		}

		try {
			const primaryCity = selectedCities[0].city
			const createTripData = {
				tripStartDate: formatDateForStorage(tripStartDate),
				selectedCitiesWithCriteria: selectedCities,
				selectedCityId: primaryCity.id.toString(),
				selectedCityName: primaryCity.name,
				selectedCountryId: primaryCity.countryId.toString(),
				selectedCountryName: primaryCity.country.name,
			}

			await AsyncStorage.setItem(
				'createTripData',
				JSON.stringify(createTripData),
			)

			Alert.alert(
				'Work in Progress',
				'Trip details screen is under development.',
			)
		} catch (error) {
			Logger.error('Error storing cities data:', error)
		}
	}

	const formatDateForDisplay = (date: Date | null): string => {
		if (!date) return 'Select date'
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
	}

	const formatDateForStorage = (date: Date): string => {
		return date.toISOString().split('T')[0] // YYYY-MM-DD format
	}

	const handleStartDateChange = (event: any, selectedDate?: Date) => {
		if (selectedDate) {
			setTripStartDate(selectedDate)
		}
	}

	const handleBackPress = () => {
		router.back()
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
					<Text style={styles.headerTitle}>Plan Your Trip</Text>
					<View style={styles.placeholder} />
				</View>

				<ScrollView
					style={styles.content}
					showsVerticalScrollIndicator={false}
				>
					{selectedCities.length === 0 && (
						<>
							{/* Main Title */}
							<Text style={styles.title}>
								Where do you want to start your journey?
							</Text>
							<Text style={styles.subtitle}>
								First, let&apos;s set your travel dates, then
								choose your destinations
							</Text>
						</>
					)}

					{/* Trip Dates Section */}
					<View style={styles.tripDatesSection}>
						<Text style={styles.sectionTitle}>Trip Start Date</Text>
						<View style={styles.dateInputsContainer}>
							<View style={styles.dateInputGroup}>
								<DateTimePicker
									value={tripStartDate}
									mode="date"
									display="default"
									onChange={handleStartDateChange}
									minimumDate={new Date()}
								/>
							</View>
						</View>
					</View>

					{/* Destination Search */}
					<DestinationSearch
						searchQuery={searchQuery}
						onSearchQueryChange={setSearchQuery}
						onSearch={handleSearch}
						hasSearched={hasSearched}
						isSearching={isSearching}
						searchResults={searchResults}
						selectedCities={selectedCities}
						onCitySelect={handleCitySelect}
					/>

					{/* Popular Destinations */}
					<PopularCities
						popularCities={popularCities}
						selectedCities={selectedCities}
						isSearching={isSearching}
						hasSearched={hasSearched}
						searchQuery={searchQuery}
						searchResults={searchResults}
						onCitySelect={handleCitySelect}
					/>

					{/* Trip plan overview */}
					<CreateTripPlanOverview
						selectedCities={selectedCities}
						tripStartDate={tripStartDate}
						tripDuration={tripDuration}
						onCitySelect={handleCitySelect}
						onFinalizeTripSelection={handleFinalizeTripSelection}
						formatDateForDisplay={formatDateForDisplay}
						onCitiesReorder={handleCitiesReorder}
					/>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Criteria Modal - Isolated outside of other containers */}
			<CriteriaModal
				visible={criteriaModal.visible}
				city={criteriaModal.city}
				criterias={recommendationCriterias}
				onClose={() => setCriteriaModal({ visible: false, city: null })}
				onSubmit={addCityWithCriteria}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	keyboardAvoid: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingVertical: 16,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 2,
	},
	backButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: '#f8fafc',
	},
	backButtonText: {
		fontSize: 16,
		color: '#6366f1',
		fontWeight: '600',
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1f2937',
	},
	placeholder: {
		width: 60, // Same width as back button for centering
	},
	content: {
		flex: 1,
		padding: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: '800',
		color: '#1f2937',
		marginBottom: 12,
		textAlign: 'center',
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: 18,
		color: '#6b7280',
		textAlign: 'center',
		marginBottom: 40,
		lineHeight: 26,
		paddingHorizontal: 16,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 20,
	},

	tripDatesSection: {
		backgroundColor: '#fff',
		padding: 24,
		borderRadius: 16,
		marginBottom: 32,
		borderWidth: 1,
		borderColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
	},
	dateInputsContainer: {
		flexDirection: 'row',
		gap: 12,
	},
	dateInputGroup: {
		flex: 1,
		width: '50%',
	},
	dateLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	dateInput: {
		backgroundColor: '#fff',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 14,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	dateButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#fff',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 14,
		borderWidth: 1,
		borderColor: '#ddd',
		minHeight: 48,
	},
	dateButtonText: {
		fontSize: 14,
		color: '#333',
		flex: 1,
	},
	dateButtonPlaceholder: {
		color: '#999',
	},
	calendarIcon: {
		fontSize: 16,
		marginLeft: 8,
	},
})
