import { DayCard } from '@/components/trip/DayCard'
import { useTripContext } from '@/contexts/TripContext'
import { Logger } from '@/services/logger'
import { tripService } from '@/services/trip/service'
import { TripDetails } from '@/services/trip/types'
import {
	RelativePathString,
	useLocalSearchParams,
	useRouter,
} from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

const calculateDayDate = (startDate: Date, dayNumber: number): Date => {
	const date = new Date(startDate)
	date.setDate(date.getDate() + (dayNumber - 1))
	return date
}

export default function TripDetailsScreen() {
	const router = useRouter()
	const { tripId, from } = useLocalSearchParams<{
		tripId?: string
		from?: any
	}>()
	const {
		tripDetails: contextTripDetails,
		tripStartDate,
		clearTripData,
	} = useTripContext()
	const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
	const [startDate, setStartDate] = useState<Date>(new Date())
	const [selectedCityIndex, setSelectedCityIndex] = useState(0)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const loadTripDetails = async () => {
			try {
				if (tripId) {
					// Fetch trip from API
					const details = await tripService.getTripById(tripId)
					setTripDetails(details)
					// Use current date as fallback when fetching from API
					// In a real app, you might want to fetch this from the backend
					setStartDate(new Date())
				} else if (contextTripDetails) {
					// Use context data if no tripId (coming from create-trip)
					setTripDetails(contextTripDetails)
					setStartDate(tripStartDate)
				}
			} catch (error) {
				Logger.error('Error loading trip details:', error)
				Alert.alert(
					'Error',
					'Failed to load trip details. Please try again.',
					[
						{
							text: 'OK',
							onPress: () => router.replace('/home'),
						},
					],
				)
			} finally {
				setIsLoading(false)
			}
		}

		loadTripDetails()
	}, [tripId, contextTripDetails, router, tripStartDate])

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingState}>
					<ActivityIndicator size="large" color="#6366f1" />
					<Text style={styles.loadingText}>Loading your trip...</Text>
				</View>
			</SafeAreaView>
		)
	}

	if (!tripDetails) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.emptyState}>
					<Text style={styles.emptyIcon}>📭</Text>
					<Text style={styles.emptyTitle}>No Trip Found</Text>
					<Text style={styles.emptyDescription}>
						Start planning your adventure!
					</Text>
				</View>
			</SafeAreaView>
		)
	}

	const selectedCity = tripDetails.cities[selectedCityIndex]
	const totalDays = tripDetails.cities.reduce(
		(sum, city) => sum + city.days.length,
		0,
	)

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => {
						if (from && from !== '') {
							router.replace(from)
							clearTripData()
							return
						}

						clearTripData()
						router.replace('/home')
					}}
				>
					<Text style={styles.backIcon}>←</Text>
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle}>Your Trip</Text>
					<Text style={styles.headerSubtitle}>
						{tripDetails.cities.length} destination
						{tripDetails.cities.length > 1 ? 's' : ''} • {totalDays}{' '}
						days
					</Text>
				</View>
				<View style={styles.headerRight} />
			</View>

			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				{tripDetails.cities.length > 1 && (
					<View style={styles.cityTabs}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.cityTabsContent}
						>
							{tripDetails.cities.map((city, index) => (
								<TouchableOpacity
									key={index}
									style={[
										styles.cityTab,
										selectedCityIndex === index &&
											styles.cityTabActive,
									]}
									onPress={() => setSelectedCityIndex(index)}
								>
									<Text
										style={[
											styles.cityTabText,
											selectedCityIndex === index &&
												styles.cityTabTextActive,
										]}
									>
										{city.cityName}
									</Text>
									<View style={styles.cityTabBadge}>
										<Text style={styles.cityTabBadgeText}>
											{city.days.length}d
										</Text>
									</View>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				)}
				<View style={styles.cityHeader}>
					<View style={styles.cityHeaderLeft}>
						<Text style={styles.cityIcon}>📍</Text>
						<View>
							<Text style={styles.cityName}>
								{selectedCity.cityName}
							</Text>
							<Text style={styles.cityDuration}>
								{selectedCity.days.length} day
								{selectedCity.days.length > 1 ? 's' : ''}{' '}
								itinerary
							</Text>
						</View>
					</View>
				</View>
				<View style={styles.daysList}>
					{selectedCity.days.map((day, index) => {
						const daysBefore = tripDetails.cities
							.slice(0, selectedCityIndex)
							.reduce((sum, city) => sum + city.days.length, 0)
						const currentDayOffset = daysBefore + index + 1
						const dayDate = calculateDayDate(
							startDate,
							currentDayOffset,
						)

						return (
							<DayCard
								key={currentDayOffset}
								dayItinerary={day}
								dayDate={dayDate}
								isFirst={index === 0}
							/>
						)
					})}
				</View>
				<View style={styles.actions}>
					{/* <TouchableOpacity
						style={styles.primaryButton}
						onPress={() => {
							// TODO: Implement share functionality
							console.log('Share trip')
						}}
					>
						<Text style={styles.primaryButtonText}>Share Trip</Text>
					</TouchableOpacity> */}
				</View>
				{/* Bottom Padding */}
				<View style={styles.bottomPadding} />
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: '#ffffff',
		borderBottomWidth: 1,
		borderBottomColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 12,
		backgroundColor: '#f1f5f9',
		alignItems: 'center',
		justifyContent: 'center',
	},
	backIcon: {
		fontSize: 20,
		color: '#1f2937',
	},
	headerCenter: {
		flex: 1,
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 2,
	},
	headerSubtitle: {
		fontSize: 13,
		fontWeight: '500',
		color: '#6b7280',
	},
	headerRight: {
		width: 40,
	},
	scrollView: {
		flex: 1,
	},
	cityTabs: {
		backgroundColor: '#ffffff',
		borderBottomWidth: 1,
		borderBottomColor: '#f1f5f9',
		paddingVertical: 12,
	},
	cityTabsContent: {
		paddingHorizontal: 20,
		gap: 8,
	},
	cityTab: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: '#f8f9fa',
		gap: 8,
	},
	cityTabActive: {
		backgroundColor: '#f0f4ff',
	},
	cityTabText: {
		fontSize: 15,
		fontWeight: '500',
		color: '#6b7280',
	},
	cityTabTextActive: {
		color: '#6366f1',
		fontWeight: '600',
	},
	cityTabBadge: {
		backgroundColor: 'rgba(99, 102, 241, 0.15)',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 8,
	},
	cityTabBadgeText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#6366f1',
	},
	cityHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 20,
		backgroundColor: '#ffffff',
		marginBottom: 16,
	},
	cityHeaderLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	cityIcon: {
		fontSize: 32,
	},
	cityName: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 2,
	},
	cityDuration: {
		fontSize: 14,
		fontWeight: '500',
		color: '#6b7280',
	},
	daysList: {
		paddingHorizontal: 20,
	},
	actions: {
		flexDirection: 'row',
		gap: 12,
		paddingHorizontal: 20,
		marginTop: 24,
	},
	primaryButton: {
		flex: 1,
		backgroundColor: '#6366f1',
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	primaryButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#ffffff',
	},
	secondaryButton: {
		flex: 1,
		backgroundColor: '#f1f5f9',
		paddingVertical: 16,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondaryButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#6b7280',
	},
	bottomPadding: {
		height: 32,
	},
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 32,
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
		textAlign: 'center',
	},
	emptyDescription: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
		marginBottom: 32,
	},
	loadingState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 32,
		gap: 16,
	},
	loadingText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#6b7280',
		textAlign: 'center',
	},
})
