import SearchBar from '@/components/ui/SearchBar'
import { City } from '@/services/city/types'
import React from 'react'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

interface CityWithCriteria {
	city: City
	data: {
		budget: number
		duration: number
		criterias: any[]
	}
}

interface DestinationSearchProps {
	searchQuery: string
	onSearchQueryChange: (query: string) => void
	onSearch: () => void
	hasSearched: boolean
	isSearching: boolean
	searchResults: City[]
	selectedCities: CityWithCriteria[]
	onCitySelect: (city: City) => void
}

export default function DestinationSearch({
	searchQuery,
	onSearchQueryChange,
	onSearch,
	hasSearched,
	isSearching,
	searchResults,
	selectedCities,
	onCitySelect,
}: DestinationSearchProps) {
	return (
		<View style={styles.container}>
			{/* Search Box */}
			<SearchBar
				value={searchQuery}
				onChangeText={onSearchQueryChange}
				onSubmitEditing={onSearch}
				onSearchPress={onSearch}
				placeholder="Search destinations..."
				autoCapitalize="words"
				returnKeyType="search"
				variant="elevated"
				size="large"
				containerStyle={styles.searchContainer}
			/>

			{/* Search Results */}
			{(hasSearched || searchQuery) && (
				<View style={styles.searchResults}>
					{isSearching ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="small" color="#007AFF" />
							<Text style={styles.loadingText}>Searching...</Text>
						</View>
					) : searchResults.length > 0 ? (
						<View style={styles.resultsGrid}>
							{searchResults.map((city) => {
								const isSelected = selectedCities.some(
									(sc) => sc.city.id === city.id,
								)
								return (
									<TouchableOpacity
										key={city.id}
										style={[
											styles.resultCard,
											isSelected && styles.selectedCard,
										]}
										onPress={() => onCitySelect(city)}
									>
										<View style={styles.cardHeader}>
											<Text style={styles.cityName}>
												{city.name}
											</Text>
											{isSelected && (
												<Text
													style={styles.selectedBadge}
												>
													✓
												</Text>
											)}
										</View>
										<Text style={styles.countryName}>
											{city.country.name}
										</Text>
										<Text style={styles.population}>
											Population:{' '}
											{city.population.toLocaleString()}
										</Text>
									</TouchableOpacity>
								)
							})}
						</View>
					) : hasSearched ? (
						<Text style={styles.noResults}>
							No cities found for &quot;{searchQuery}&quot;
						</Text>
					) : null}
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 32,
	},
	searchContainer: {
		marginBottom: 20,
	},
	searchResults: {
		// Removed marginBottom since it's now handled by the container
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
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
	},
	cityName: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 6,
	},
	countryName: {
		fontSize: 15,
		color: '#6b7280',
		marginBottom: 6,
		fontWeight: '500',
	},
	population: {
		fontSize: 13,
		color: '#9ca3af',
	},
	noResults: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		fontStyle: 'italic',
		padding: 20,
	},
	selectedCard: {
		borderColor: '#6366f1',
		borderWidth: 2,
		backgroundColor: '#f0f4ff',
		shadowColor: '#6366f1',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 6,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 4,
	},
	selectedBadge: {
		fontSize: 18,
		color: '#6366f1',
		fontWeight: 'bold',
	},
})
