import { City } from '@/services/city/types'
import { Criteria } from '@/services/recommendation/types'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated'

interface CityWithCriteria {
	city: City
	data: {
		budget: number
		duration: number
		criterias: Criteria[]
	}
}

interface CreateTripPlanOverviewProps {
	selectedCities: CityWithCriteria[]
	tripStartDate: Date | null
	tripDuration: number | null
	onCitySelect: (city: City) => void
	onFinalizeTripSelection: () => void
	formatDateForDisplay: (date: Date | null) => string
	onCitiesReorder: (reorderedCities: CityWithCriteria[]) => void
}

export default function CreateTripPlanOverview({
	selectedCities,
	tripStartDate,
	tripDuration,
	onCitySelect,
	onFinalizeTripSelection,
	formatDateForDisplay,
	onCitiesReorder,
}: CreateTripPlanOverviewProps) {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

	if (selectedCities.length === 0) {
		return null
	}

	const reorderCities = (fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return

		const newCities = [...selectedCities]
		const [movedCity] = newCities.splice(fromIndex, 1)
		newCities.splice(toIndex, 0, movedCity)
		onCitiesReorder(newCities)
	}

	const DraggableCityItem = ({
		cityWithCriteria,
		index,
	}: {
		cityWithCriteria: CityWithCriteria
		index: number
	}) => {
		const translateY = useSharedValue(0)
		const isDragging = useSharedValue(false)

		const panGesture = Gesture.Pan()
			.minDistance(10)
			.onStart(() => {
				isDragging.value = true
				runOnJS(setDraggedIndex)(index)
			})
			.onUpdate((event) => {
				translateY.value = event.translationY
			})
			.onEnd(() => {
				const moved = Math.round(translateY.value / 140) // Adjusted for card height + gap
				const newIndex = Math.max(
					0,
					Math.min(selectedCities.length - 1, index + moved),
				)

				runOnJS(reorderCities)(index, newIndex)
				runOnJS(setDraggedIndex)(null)

				translateY.value = withSpring(0)
				isDragging.value = false
			})

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ translateY: translateY.value }],
			zIndex: isDragging.value ? 1000 : 0,
			elevation: isDragging.value ? 10 : 2,
			opacity: isDragging.value ? 0.9 : 1,
			shadowOpacity: isDragging.value ? 0.3 : 0.05,
			scale: isDragging.value ? 1.05 : 1,
		}))

		const isCurrentlyDragged = draggedIndex === index

		return (
			<GestureDetector gesture={panGesture}>
				<Animated.View
					style={[
						styles.selectedCityCard,
						animatedStyle,
						isCurrentlyDragged && styles.draggingCard,
					]}
				>
					<View style={styles.selectedCityHeader}>
						<Text style={styles.selectedCityName}>
							{cityWithCriteria.city.name}
						</Text>
						<View style={styles.cityActions}>
							<TouchableOpacity
								onPress={() => {
									onCitySelect(cityWithCriteria.city)
								}}
								style={styles.removeButton}
							>
								<Text style={styles.removeButtonText}>✕</Text>
							</TouchableOpacity>
						</View>
					</View>
					<Text style={styles.selectedCityCountry}>
						{cityWithCriteria.city.country.name}
					</Text>
					<View style={styles.criteriaContainer}>
						<Text style={styles.criteriaText}>
							Budget: {cityWithCriteria.data.budget}$
						</Text>
						<Text style={styles.criteriaText}>
							Duration: {cityWithCriteria.data.duration} days
						</Text>
						<Text style={styles.criteriaText}>
							Activities:{' '}
							{cityWithCriteria.data.criterias
								.map((criteria: Criteria) => criteria.name)
								.join(', ')}
						</Text>
					</View>
				</Animated.View>
			</GestureDetector>
		)
	}

	return (
		<View style={styles.selectedSection}>
			<Text style={styles.sectionTitle}>Your Trip Plan</Text>
			{tripStartDate && (
				<View style={styles.tripDatesDisplay}>
					<Text style={styles.tripDatesTitle}>
						Trip Duration: {formatDateForDisplay(tripStartDate)} to{' '}
						{formatDateForDisplay(
							new Date(
								tripStartDate.getTime() +
									(((tripDuration ?? 0) as number) - 1) *
										24 *
										60 *
										60 *
										1000,
							),
						)}
					</Text>
				</View>
			)}
			<View style={styles.citiesHeaderContainer}>
				<Text style={styles.citiesSectionTitle}>
					Selected Cities ({selectedCities.length})
				</Text>
				<Text style={styles.dragInstruction}>Drag to reorder</Text>
			</View>
			<View style={styles.selectedGrid}>
				{selectedCities.map((cityWithCriteria, index) => (
					<DraggableCityItem
						key={cityWithCriteria.city.id}
						cityWithCriteria={cityWithCriteria}
						index={index}
					/>
				))}
				<Text style={styles.citiesSectionTitle}>
					Total budget:{' '}
					{selectedCities
						.reduce((total, cityWithCriteria) => {
							const budget = cityWithCriteria.data.budget
							return total + (isNaN(budget) ? 0 : budget)
						}, 0)
						.toLocaleString(undefined, {
							maximumFractionDigits: 2,
						})}
					$ (per person)
				</Text>
			</View>

			<TouchableOpacity
				style={styles.finalizeButton}
				onPress={onFinalizeTripSelection}
			>
				<Text style={styles.finalizeButtonText}>
					Continue with {selectedCities.length}{' '}
					{selectedCities.length === 1 ? 'City' : 'Cities'}
				</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	selectedSection: {
		marginBottom: 32,
		backgroundColor: '#fff',
		padding: 24,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 6,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 20,
	},
	tripDatesDisplay: {
		backgroundColor: '#f0f4ff',
		padding: 16,
		borderRadius: 12,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: '#e0e7ff',
	},
	tripDatesTitle: {
		fontSize: 15,
		fontWeight: '600',
		color: '#6366f1',
		textAlign: 'center',
	},
	citiesHeaderContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	citiesSectionTitle: {
		fontSize: 17,
		fontWeight: '600',
		color: '#1f2937',
	},
	dragInstruction: {
		fontSize: 12,
		color: '#6b7280',
		fontStyle: 'italic',
	},
	selectedGrid: {
		gap: 12,
	},
	selectedCityCard: {
		backgroundColor: '#f8f9fa',
		padding: 20,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	selectedCityHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	cityActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	draggingCard: {
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	selectedCityName: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		flex: 1,
	},
	selectedCityCountry: {
		fontSize: 15,
		color: '#6b7280',
		marginBottom: 16,
		fontWeight: '500',
	},
	removeButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#ef4444',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#ef4444',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},
	removeButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	criteriaContainer: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	criteriaText: {
		fontSize: 14,
		color: '#6b7280',
		marginBottom: 6,
		fontWeight: '500',
	},
	finalizeButton: {
		backgroundColor: '#6366f1',
		paddingVertical: 18,
		paddingHorizontal: 32,
		borderRadius: 16,
		alignItems: 'center',
		marginTop: 24,
		shadowColor: '#6366f1',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	finalizeButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
	},
})
