import { DayItinerary } from '@/services/trip/types'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface DayCardProps {
	dayItinerary: DayItinerary
	dayDate: Date
	isFirst?: boolean
}

function formatDate(date: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	}
	return date.toLocaleDateString('en-US', options)
}

function getWeatherIcon(dayPhrase: string): string {
	const phrase = dayPhrase.toLowerCase()
	
	// Clear conditions
	if (phrase.includes('clear sky') || phrase.includes('mainly clear')) return '☀️'
	
	// Partly cloudy
	if (phrase.includes('partly cloudy')) return '⛅'
	
	// Overcast
	if (phrase.includes('overcast')) return '☁️'
	
	// Fog
	if (phrase.includes('fog')) return '🌫️'
	
	// Thunderstorm
	if (phrase.includes('thunderstorm')) return '⛈️'
	
	// Snow
	if (phrase.includes('snow')) return '❄️'
	
	// Freezing rain
	if (phrase.includes('freezing rain')) return '🌨️'
	
	// Rain (including drizzle and showers)
	if (phrase.includes('rain') || phrase.includes('drizzle') || phrase.includes('shower')) return '🌧️'
	
	// Default
	return '🌤️'
}

export function DayCard({
	dayItinerary,
	dayDate,
	isFirst = false,
}: DayCardProps) {
	const [expanded, setExpanded] = useState(isFirst)

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.header}
				onPress={() => setExpanded(!expanded)}
				activeOpacity={0.7}
			>
				<View style={styles.headerLeft}>
					<View style={styles.dayBadge}>
						<Text style={styles.dayBadgeText}>
							Day {dayItinerary.day}
						</Text>
					</View>
					<View style={styles.headerInfo}>
						<Text style={styles.dateText}>
							{formatDate(new Date(dayDate))}
						</Text>
						<Text style={styles.headerTitle}>
							{dayItinerary.places.length} places •{' '}
							{dayItinerary.foodPlaces.length} restaurants
						</Text>
					</View>
				</View>
				<View style={styles.headerRight}>
					{dayItinerary.weather ? (
						<View style={styles.weatherContainer}>
							<Text style={styles.weatherIcon}>
								{getWeatherIcon(dayItinerary.weather.dayPhrase)}
							</Text>
							<View style={styles.weatherInfo}>
								<Text style={styles.weatherTemp}>
									{Math.round(dayItinerary.weather.temperature.minC)}°-
									{Math.round(dayItinerary.weather.temperature.maxC)}°
								</Text>
								<Text style={styles.weatherPrecip}>
									💧 {dayItinerary.weather.precipitationProbability}%
								</Text>
							</View>
						</View>
					) : (
						<View style={styles.weatherUnavailableContainer}>
							<Text style={styles.weatherUnavailableIcon}>ℹ️</Text>
							<Text style={styles.weatherUnavailableText}>
								Weather{'\n'}unavailable
							</Text>
						</View>
					)}
					<Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
				</View>
			</TouchableOpacity>

			{expanded && (
				<View style={styles.content}>
					{/* Places Section */}
					{dayItinerary.places.length > 0 && (
						<View style={styles.section}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionIcon}>📍</Text>
								<Text style={styles.sectionTitle}>
									Places to Visit
								</Text>
							</View>
							{dayItinerary.places.map((place, index) => (
								<View key={index} style={styles.item}>
									<View style={styles.itemNumber}>
										<Text style={styles.itemNumberText}>
											{index + 1}
										</Text>
									</View>
									<View style={styles.itemContent}>
										<Text style={styles.itemName}>
											{place.name}
										</Text>
										<Text style={styles.itemDescription}>
											{place.description}
										</Text>
									</View>
								</View>
							))}
						</View>
					)}

					{/* Food Places Section */}
					{dayItinerary.foodPlaces.length > 0 && (
						<View
							style={[
								styles.section,
								dayItinerary.places.length > 0 &&
									styles.sectionWithMargin,
							]}
						>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionIcon}>🍽️</Text>
								<Text style={styles.sectionTitle}>
									Where to Eat
								</Text>
							</View>
							{dayItinerary.foodPlaces.map((foodPlace, index) => (
								<View key={index} style={styles.item}>
									<View style={styles.itemNumber}>
										<Text style={styles.itemNumberText}>
											{index + 1}
										</Text>
									</View>
									<View style={styles.itemContent}>
										<Text style={styles.itemName}>
											{foodPlace.name}
										</Text>
										<Text style={styles.itemDescription}>
											{foodPlace.description}
										</Text>
									</View>
								</View>
							))}
						</View>
					)}
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#f1f5f9',
		marginBottom: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 20,
		paddingHorizontal: 10,
		backgroundColor: '#ffffff',
	},
	headerLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		gap: 12,
	},
	headerInfo: {
		flex: 1,
		gap: 2,
	},
	dateText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
	},
	dayBadge: {
		backgroundColor: '#f0f4ff',
		paddingHorizontal: 6,
		paddingVertical: 6,
		borderRadius: 12,
	},
	dayBadgeText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6366f1',
	},
	headerTitle: {
		fontSize: 14,
		fontWeight: '500',
		color: '#6b7280',
		flex: 1,
	},
	headerRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	weatherContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		backgroundColor: '#f0f9ff',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 12,
	},
	weatherIcon: {
		fontSize: 16,
	},
	weatherInfo: {
		gap: 2,
	},
	weatherTemp: {
		fontSize: 12,
		fontWeight: '600',
		color: '#0369a1',
	},
	weatherPrecip: {
		fontSize: 10,
		fontWeight: '500',
		color: '#0284c7',
	},
	weatherUnavailableContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: '#f8fafc',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	weatherUnavailableIcon: {
		fontSize: 10,
	},
	weatherUnavailableText: {
		fontSize: 10,
		fontWeight: '400',
		color: '#94a3b8',
	},
	expandIcon: {
		fontSize: 12,
		color: '#9ca3af',
		marginLeft: 8,
	},
	content: {
		borderTopWidth: 1,
		borderTopColor: '#f1f5f9',
		backgroundColor: '#fafbfc',
	},
	section: {
		padding: 20,
	},
	sectionWithMargin: {
		paddingTop: 0,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		gap: 8,
	},
	sectionIcon: {
		fontSize: 18,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1f2937',
	},
	item: {
		flexDirection: 'row',
		marginBottom: 16,
		gap: 12,
	},
	itemNumber: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#6366f1',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 2,
	},
	itemNumberText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#ffffff',
	},
	itemContent: {
		flex: 1,
	},
	itemName: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 4,
		lineHeight: 20,
	},
	itemDescription: {
		fontSize: 14,
		color: '#6b7280',
		lineHeight: 20,
	},
})
