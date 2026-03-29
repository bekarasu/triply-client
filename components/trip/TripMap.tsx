import { CityItinerary, Place } from '@/services/trip/types'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'

interface TripMapProps {
	cities: CityItinerary[]
	selectedDayIndex?: number
	selectedCityIndex?: number
}

interface PlaceMarker {
	place: Place
	cityName: string
	dayNumber: number
	placeIndexInDay: number
	coordinate: {
		latitude: number
		longitude: number
	}
}

// Color palette for days
const DAY_COLORS = [
	'#ef4444', // Day 1 - red
	'#3b82f6', // Day 2 - blue
	'#10b981', // Day 3 - green
	'#f59e0b', // Day 4 - amber
	'#8b5cf6', // Day 5 - purple
	'#ec4899', // Day 6 - pink
	'#14b8a6', // Day 7 - teal
	'#f97316', // Day 8 - orange
	'#6366f1', // Day 9 - indigo
	'#84cc16', // Day 10 - lime
]

function getDayColor(dayNumber: number): string {
	const index = (dayNumber - 1) % DAY_COLORS.length
	return DAY_COLORS[index]
}

function calculateMapRegion(markers: PlaceMarker[]): Region {
	if (markers.length === 0) {
		return {
			latitude: 41.0082,
			longitude: 28.9784,
			latitudeDelta: 0.1,
			longitudeDelta: 0.1,
		}
	}

	if (markers.length === 1) {
		return {
			latitude: markers[0].coordinate.latitude,
			longitude: markers[0].coordinate.longitude,
			latitudeDelta: 0.05,
			longitudeDelta: 0.05,
		}
	}

	const latitudes = markers.map((m) => m.coordinate.latitude)
	const longitudes = markers.map((m) => m.coordinate.longitude)

	const minLat = Math.min(...latitudes)
	const maxLat = Math.max(...latitudes)
	const minLng = Math.min(...longitudes)
	const maxLng = Math.max(...longitudes)

	const latDelta = (maxLat - minLat) * 1.5 || 0.1
	const lngDelta = (maxLng - minLng) * 1.5 || 0.1

	return {
		latitude: (minLat + maxLat) / 2,
		longitude: (minLng + maxLng) / 2,
		latitudeDelta: Math.max(latDelta, 0.02),
		longitudeDelta: Math.max(lngDelta, 0.02),
	}
}

export function TripMap({
	cities,
	selectedDayIndex,
	selectedCityIndex,
}: TripMapProps) {
	const markers = useMemo(() => {
		const placeMarkers: PlaceMarker[] = []

		cities.forEach((city, cityIndex) => {
			// If a city is selected, only show places from that city
			if (
				selectedCityIndex !== undefined &&
				selectedCityIndex !== cityIndex
			) {
				return
			}

			city.days.forEach((day, dayIndex) => {
				// If a day is selected, only show places from that day
				if (
					selectedDayIndex !== undefined &&
					selectedDayIndex !== dayIndex
				) {
					return
				}

				let placeIndexInDay = 0
				day.places.forEach((place) => {
					if (
						place.latitude != null &&
						place.longitude != null &&
						typeof place.latitude === 'number' &&
						typeof place.longitude === 'number'
					) {
						placeIndexInDay++
						placeMarkers.push({
							place,
							cityName: city.cityName,
							dayNumber: day.day,
							placeIndexInDay: placeIndexInDay,
							coordinate: {
								latitude: place.latitude,
								longitude: place.longitude,
							},
						})
					}
				})
			})
		})

		return placeMarkers
	}, [cities, selectedCityIndex, selectedDayIndex])

	const region = useMemo(() => calculateMapRegion(markers), [markers])

	if (markers.length === 0) {
		return (
			<View style={styles.noMapContainer}>
				<Text style={styles.noMapText}>
					No places with coordinates available
				</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View style={styles.mapHeader}>
				<Text style={styles.mapTitle}>Places to Visit</Text>
				<Text style={styles.mapSubtitle}>
					{markers.length} place{markers.length > 1 ? 's' : ''} on map
				</Text>
			</View>
			<View style={styles.mapWrapper}>
				<MapView
					style={styles.map}
					initialRegion={region}
					region={region}
					scrollEnabled={true}
					zoomEnabled={true}
					rotateEnabled={false}
					pitchEnabled={false}
				>
					{markers.map((marker, index) => {
						const markerColor = getDayColor(marker.dayNumber)

						return (
							<Marker
								key={`${marker.place.name}-${marker.dayNumber}-${index}`}
								coordinate={marker.coordinate}
								title={marker.place.name}
								description={`Day ${marker.dayNumber} • Place #${marker.placeIndexInDay}`}
							>
								<View
									style={[
										styles.markerContainer,
										{ backgroundColor: markerColor },
									]}
								>
									<Text style={styles.markerText}>
										{marker.placeIndexInDay}
									</Text>
								</View>
							</Marker>
						)
					})}
				</MapView>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 20,
		marginBottom: 16,
		backgroundColor: '#ffffff',
		borderRadius: 16,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	mapHeader: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f1f5f9',
	},
	mapTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 2,
	},
	mapSubtitle: {
		fontSize: 13,
		fontWeight: '500',
		color: '#6b7280',
	},
	mapWrapper: {
		height: 280,
		borderRadius: 0,
		overflow: 'hidden',
	},
	map: {
		flex: 1,
	},
	noMapContainer: {
		marginHorizontal: 20,
		marginBottom: 16,
		backgroundColor: '#f8f9fa',
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	noMapText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#9ca3af',
		textAlign: 'center',
	},
	markerContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 3,
		borderColor: '#ffffff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	markerText: {
		fontSize: 15,
		fontWeight: '700',
		color: '#ffffff',
	},
})
