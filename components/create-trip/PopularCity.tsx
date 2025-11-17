import { City } from '@/services/city/types'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface CityWithCriteria {
	city: City
	data: {
		budget: number
		duration: number
		criterias: any[]
	}
}

interface PopularCitiesProps {
	popularCities: City[]
	selectedCities: CityWithCriteria[]
	isSearching: boolean
	hasSearched: boolean
	searchQuery: string
	searchResults: City[]
	onCitySelect: (city: City) => void
}

export default function PopularCities({
	popularCities,
	selectedCities,
	isSearching,
	hasSearched,
	searchQuery,
	searchResults,
	onCitySelect,
}: PopularCitiesProps) {
	// Only show popular destinations when not searching or when search returns no results
	const shouldShow =
		popularCities.length > 0 &&
		((!isSearching && !hasSearched && searchQuery.trim().length === 0) ||
			searchResults?.length === 0)

	if (!shouldShow) {
		return null
	}

	return (
		<View style={styles.popularSection}>
			<Text style={styles.sectionTitle}>Popular Destinations</Text>
			<View style={styles.destinationGrid}>
				{popularCities.map((city) => {
					const isSelected = selectedCities.some(
						(sc) => sc.city.id === city.id,
					)
					return (
						<TouchableOpacity
							key={city.id}
							style={[
								styles.destinationCard,
								isSelected && styles.selectedCard,
							]}
							onPress={() => onCitySelect(city)}
						>
							<View style={styles.cardHeader}>
								<Text style={styles.destinationText}>
									{`${city.name}, ${city.country.iso2}`}
								</Text>
								{isSelected && (
									<Text style={styles.selectedBadge}>✓</Text>
								)}
							</View>
						</TouchableOpacity>
					)
				})}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	popularSection: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 20,
	},
	destinationGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 12,
	},
	destinationCard: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 16,
		marginBottom: 16,
		width: '47%',
		borderWidth: 1,
		borderColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
	},
	destinationText: {
		fontSize: 15,
		color: '#1f2937',
		textAlign: 'center',
		fontWeight: '600',
		flex: 1,
	},
	selectedCard: {
		borderColor: '#6366f1',
		borderWidth: 2,
		backgroundColor: '#f0f4ff',
		shadowColor: '#6366f1',
		shadowOpacity: 0.2,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	selectedBadge: {
		fontSize: 18,
		color: '#6366f1',
		fontWeight: 'bold',
		marginLeft: 8,
	},
})
