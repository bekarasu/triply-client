import { getDayColor } from '@/constants/Colors'
import { CityItinerary, Place } from '@/services/trip/types'
import { decodePolyline, RouteCoordinate } from '@/utils/route'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, Polyline, Region } from 'react-native-maps'

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

interface RouteLine {
	key: string
	dayNumber: number
	coordinates: RouteCoordinate[]
	// No routed geometry from the backend: straight lines between the stops
	isApproximate: boolean
}

interface MapErrorBoundaryProps {
	children: React.ReactNode
	onMapRenderError: () => void
}

interface MapErrorBoundaryState {
	hasError: boolean
}

class MapErrorBoundary extends React.Component<
	MapErrorBoundaryProps,
	MapErrorBoundaryState
> {
	constructor(props: MapErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(): MapErrorBoundaryState {
		return { hasError: true }
	}

	componentDidCatch() {
		this.props.onMapRenderError()
	}

	render() {
		if (this.state.hasError) {
			return null
		}

		return this.props.children
	}
}

function calculateMapRegion(markers: PlaceMarker[]): Region {
	if (markers.length === 0) {
		return {
			latitude: 0,
			longitude: 0,
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
	const [mapHasError, setMapHasError] = useState(false)
	const mapReadyRef = useRef(false)

	const { markers, routeLines, usesGoogleContent } = useMemo(() => {
		const placeMarkers: PlaceMarker[] = []
		const dayRouteLines: RouteLine[] = []
		let hasGoogleContent = false

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
				const dayCoordinates: RouteCoordinate[] = []
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
						dayCoordinates.push({
							latitude: place.latitude,
							longitude: place.longitude,
						})
						if (place.coordinatesSource === 'google') {
							hasGoogleContent = true
						}
					}
				})

				const routeKey = `${cityIndex}-${dayIndex}`
				if (day.route?.polyline) {
					if (day.route.source === 'google') {
						hasGoogleContent = true
					}
					dayRouteLines.push({
						key: routeKey,
						dayNumber: day.day,
						coordinates: decodePolyline(day.route.polyline),
						isApproximate: false,
					})
				} else if (dayCoordinates.length > 1) {
					dayRouteLines.push({
						key: routeKey,
						dayNumber: day.day,
						coordinates: dayCoordinates,
						isApproximate: true,
					})
				}
			})
		})

		return {
			markers: placeMarkers,
			routeLines: dayRouteLines,
			usesGoogleContent: hasGoogleContent,
		}
	}, [cities, selectedCityIndex, selectedDayIndex])

	const region = useMemo(() => calculateMapRegion(markers), [markers])

	useEffect(() => {
		if (markers.length === 0) {
			setMapHasError(false)
			mapReadyRef.current = false
			return
		}

		setMapHasError(false)
		mapReadyRef.current = false
	}, [markers])

	if (markers.length === 0) {
		return (
			<View style={styles.noMapContainer}>
				<Text style={styles.noMapText}>
					No places with coordinates available
				</Text>
			</View>
		)
	}

	if (mapHasError) {
		return (
			<View style={styles.mapErrorContainer}>
				<Text style={styles.mapErrorText}>Can&apos;t load map</Text>
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
				<MapErrorBoundary onMapRenderError={() => setMapHasError(true)}>
					<MapView
						style={styles.map}
						initialRegion={region}
						region={region}
						scrollEnabled={true}
						zoomEnabled={true}
						rotateEnabled={false}
						pitchEnabled={false}
						onMapReady={() => {
							mapReadyRef.current = true
							setMapHasError(false)
						}}
						onMapLoaded={() => {
							mapReadyRef.current = true
							setMapHasError(false)
						}}
					>
						{routeLines.map((line) => (
							<Polyline
								key={line.key}
								coordinates={line.coordinates}
								strokeColor={getDayColor(line.dayNumber)}
								strokeWidth={4}
								lineCap="round"
								lineJoin="round"
								lineDashPattern={
									line.isApproximate ? [8, 8] : undefined
								}
							/>
						))}
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
				</MapErrorBoundary>
				{/* Android renders Google Maps, which already shows the Google logo */}
				{usesGoogleContent && Platform.OS !== 'android' && (
					<View style={styles.attribution}>
						<Text style={styles.attributionText}>Google Maps</Text>
					</View>
				)}
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
	attribution: {
		position: 'absolute',
		right: 8,
		bottom: 8,
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		pointerEvents: 'none',
	},
	attributionText: {
		fontSize: 11,
		fontWeight: '600',
		color: '#1f2937',
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
	mapErrorContainer: {
		marginHorizontal: 20,
		marginBottom: 16,
		backgroundColor: '#e5e7eb',
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	mapErrorText: {
		fontSize: 15,
		fontWeight: '500',
		color: '#111111',
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
