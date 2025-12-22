import Card from '@/components/ui/Card'
import { Logger } from '@/services/logger'
import { tripService } from '@/services/trip/service'
import { MyTrip } from '@/services/trip/types'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

export default function MyTripsScreen() {
	const [trips, setTrips] = useState<MyTrip[]>([])
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		loadMyTrips()
	}, [])

	const loadMyTrips = async () => {
		try {
			setLoading(true)
			const myTrips = await tripService.getMyTrips()
			setTrips(myTrips)
		} catch (error) {
			Logger.error('Error loading my trips:', error)
		} finally {
			setLoading(false)
		}
	}

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
	}

	const handleTripPress = (tripId: string) => {
		router.push({
			pathname: '/trip-details',
			params: { tripId, from: 'my-trips' },
		})
	}

	const getCityNames = (trip: MyTrip) => {
		return trip.cities.map((city) => city.cityName).join(', ')
	}

	if (loading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.replace('/home')}
						style={styles.backButton}
					>
						<Ionicons name="arrow-back" size={24} color="#fff" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>My Trips</Text>
					<View style={styles.backButton} />
				</View>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#8B5CF6" />
					<Text style={styles.loadingText}>
						Loading your trips...
					</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => {
						router.replace('/home')
					}}
				>
					<Text style={styles.backIcon}>←</Text>
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle}>My Trips</Text>
				</View>
				<View style={styles.headerRight} />
			</View>

			{/* Content */}
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{trips.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons
							name="airplane-outline"
							size={64}
							color="#fff"
						/>
						<Text style={styles.emptyTitle}>No trips yet</Text>
						<Text style={styles.emptyDescription}>
							Start planning your first adventure!
						</Text>
						<TouchableOpacity
							style={styles.createButton}
							onPress={() => router.push('/create-trip')}
						>
							<Text style={styles.createButtonText}>
								Plan Your First Trip
							</Text>
						</TouchableOpacity>
					</View>
				) : (
					trips.map((trip) => (
						<Card
							key={trip.id}
							variant="elevated"
							style={styles.tripCard}
							onPress={() => handleTripPress(trip.id)}
						>
							<View style={styles.tripHeader}>
								<View style={styles.tripInfo}>
									<Text style={styles.cityNames}>
										{getCityNames(trip)}
									</Text>
									<View style={styles.dateRow}>
										<Ionicons
											name="calendar-outline"
											size={16}
											color="#6B7280"
										/>
										<Text style={styles.dateText}>
											{formatDate(trip.startDate)} -{' '}
											{formatDate(trip.endDate)}
										</Text>
									</View>
								</View>
								<Ionicons
									name="chevron-forward"
									size={24}
									color="#9CA3AF"
								/>
							</View>

							<View style={styles.tripDetails}>
								<View style={styles.detailItem}>
									<Ionicons
										name="time-outline"
										size={18}
										color="#8B5CF6"
									/>
									<Text style={styles.detailText}>
										{trip.totalDuration}{' '}
										{trip.totalDuration === 1
											? 'day'
											: 'days'}
									</Text>
								</View>

								<View style={styles.detailItem}>
									<Ionicons
										name="location-outline"
										size={18}
										color="#EC4899"
									/>
									<Text style={styles.detailText}>
										{trip.cities.length}{' '}
										{trip.cities.length === 1
											? 'city'
											: 'cities'}
									</Text>
								</View>

								<View style={styles.detailItem}>
									<Ionicons
										name="cash-outline"
										size={18}
										color="#F59E0B"
									/>
									<Text style={styles.detailText}>
										${trip.totalBudget}
									</Text>
								</View>
							</View>

							{/* Show number of places */}
							<View style={styles.placesInfo}>
								<Text style={styles.placesText}>
									{trip.cities.reduce(
										(total, city) =>
											total +
											city.days.reduce(
												(dayTotal, day) =>
													dayTotal +
													day.places.length,
												0,
											),
										0,
									)}{' '}
									places to visit
								</Text>
							</View>
						</Card>
					))
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		gap: 16,
	},
	loadingText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#6B7280',
		textAlign: 'center',
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
    marginBottom: 15,
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
	scrollContent: {
		padding: 20,
		paddingTop: 0,
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 80,
	},
	emptyTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#fff',
		marginTop: 20,
		marginBottom: 8,
	},
	emptyDescription: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.8)',
		marginBottom: 32,
	},
	createButton: {
		backgroundColor: '#fff',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
	},
	createButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#8B5CF6',
	},
	tripCard: {
		marginBottom: 16,
	},
	tripHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 16,
	},
	tripInfo: {
		flex: 1,
	},
	cityNames: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1F2937',
		marginBottom: 8,
	},
	dateRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	dateText: {
		fontSize: 14,
		color: '#6B7280',
	},
	tripDetails: {
		flexDirection: 'row',
		gap: 20,
		marginBottom: 12,
	},
	detailItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	detailText: {
		fontSize: 14,
		color: '#374151',
		fontWeight: '500',
	},
	placesInfo: {
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#F3F4F6',
	},
	placesText: {
		fontSize: 14,
		color: '#6B7280',
		fontStyle: 'italic',
	},
})
