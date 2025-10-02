import { cityService } from '@/services/city/service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { City } from '../services/city/types'

export default function CreateTripScreen() {
	const [searchQuery, setSearchQuery] = useState('')
	const [popularCities, setPopularCities] = useState<City[]>([])
	const [searchResults, setSearchResults] = useState<City[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [hasSearched, setHasSearched] = useState(false)
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
				console.log('Search results:', response)
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
	}, [])

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

	const handleCitySelect = async (city: City) => {
		console.log('Selected city:', city)
		try {
			await AsyncStorage.setItem('selectedCityId', city.id.toString())
			await AsyncStorage.setItem('selectedCityName', city.name)
			console.log('selectedCountryId', city.countryId)
			console.log({ city })
			await AsyncStorage.setItem(
				'selectedCountryId',
				city.countryId.toString(),
			)
			await AsyncStorage.setItem('selectedCountryName', city.country.name)

			router.push('/trip-details')
		} catch (error) {
			console.error('Error storing city data:', error)
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
					{/* Main Title */}
					<Text style={styles.title}>
						Where do you want to start your journey?
					</Text>
					<Text style={styles.subtitle}>
						Search for destinations, cities, or attractions
					</Text>

					{/* Search Box */}
					<View style={styles.searchContainer}>
						<TextInput
							style={styles.searchInput}
							placeholder="Search destinations..."
							placeholderTextColor="#999"
							value={searchQuery}
							onChangeText={setSearchQuery}
							onSubmitEditing={handleSearch}
							autoCapitalize="words"
							returnKeyType="search"
						/>
						<TouchableOpacity
							style={styles.searchButton}
							onPress={handleSearch}
						>
							<Text style={styles.searchButtonText}>🔍</Text>
						</TouchableOpacity>
					</View>

					{/* Recent Searches */}
					{(hasSearched || searchQuery) && (
						<View style={styles.searchResults}>
							{isSearching ? (
								<View style={styles.loadingContainer}>
									<ActivityIndicator
										size="small"
										color="#007AFF"
									/>
									<Text style={styles.loadingText}>
										Searching...
									</Text>
								</View>
							) : searchResults.length > 0 ? (
								<View style={styles.resultsGrid}>
									{searchResults.map((city) => (
										<TouchableOpacity
											key={city.id}
											style={styles.resultCard}
											onPress={() =>
												handleCitySelect(city)
											}
										>
											<Text style={styles.cityName}>
												{city.name}
											</Text>
											<Text style={styles.countryName}>
												{city.country.name}
											</Text>
											<Text style={styles.population}>
												Population:{' '}
												{city.population.toLocaleString()}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							) : hasSearched ? (
								<Text style={styles.noResults}>
									No cities found for &quot;{searchQuery}
									&quot;
								</Text>
							) : null}
						</View>
					)}

					{/* Popular Destinations */}
					{popularCities.length > 0 &&
						((!isSearching &&
							!hasSearched &&
							searchQuery.trim().length === 0) ||
							searchResults?.length === 0) && (
							<View style={styles.popularSection}>
								<Text style={styles.sectionTitle}>
									Popular Destinations
								</Text>
								<View style={styles.destinationGrid}>
									{popularCities.map((city) => (
										<TouchableOpacity
											key={city.id}
											style={styles.destinationCard}
											onPress={() =>
												handleCitySelect(city)
											}
										>
											<Text
												style={styles.destinationText}
											>
												{`${city.name}, ${city.country.iso2}`}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						)}
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
		width: 60, // Same width as back button for centering
	},
	content: {
		flex: 1,
		padding: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 8,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 32,
	},
	searchContainer: {
		flexDirection: 'row',
		marginBottom: 32,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	searchInput: {
		flex: 1,
		backgroundColor: '#f8f9fa',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 16,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#e9ecef',
		borderRightWidth: 0,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},
	searchButton: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderTopRightRadius: 12,
		borderBottomRightRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	searchButtonText: {
		fontSize: 18,
	},
	popularSection: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#333',
		marginBottom: 16,
	},
	destinationGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	destinationCard: {
		backgroundColor: '#f8f9fa',
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
		width: '48%',
		borderWidth: 1,
		borderColor: '#e9ecef',
	},
	destinationText: {
		fontSize: 14,
		color: '#333',
		textAlign: 'center',
		fontWeight: '500',
	},
	searchResults: {
		marginBottom: 32,
	},
	loadingContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	loadingText: {
		marginLeft: 10,
		fontSize: 16,
		color: '#666',
	},
	resultsGrid: {
		gap: 12,
	},
	resultCard: {
		backgroundColor: '#f8f9fa',
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#e9ecef',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	cityName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	countryName: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4,
	},
	population: {
		fontSize: 12,
		color: '#999',
	},
	noResults: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		fontStyle: 'italic',
		padding: 20,
	},
})
