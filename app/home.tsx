import { authService } from '@/services/auth/service'
import { cityService } from '@/services/city/service'
import { City } from '@/services/city/types'
import { Logger } from '@/services/logger'
import { profileService } from '@/services/profile/service'
import { Profile } from '@/services/profile/types'
import { tripService } from '@/services/trip/service'
import { TripOverview } from '@/services/trip/types'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native'

export default function HomeScreen() {
	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(true)
	const [showProfileMenu, setShowProfileMenu] = useState(false)
	const [popularCities, setPopularCities] = useState<City[]>([])
	const [upcomingTrips, setUpcomingTrips] = useState<TripOverview[]>([])
	const router = useRouter()

	useEffect(() => {
		loadUserData()
		loadPopularCities()
		loadUpcomingTrips()
	}, [])

	const loadUserData = async () => {
		try {
			const profile = await profileService.getInfo()
			await profileService.storeData(profile)
			setProfile(profile)
		} catch (error) {
			console.error('Error loading user data:', error)
		} finally {
			setLoading(false)
		}
	}

	const loadPopularCities = async () => {
		try {
			const cities = await cityService.getPopularCities()
			setPopularCities(cities)
		} catch (error) {
			Logger.error('Error loading popular cities:', error)
			// Keep empty array on error
		}
	}

	const loadUpcomingTrips = async () => {
		try {
			const trips = await tripService.getTripsOverview()
			setUpcomingTrips(trips)
		} catch (error) {
			Logger.error('Error loading upcoming trips:', error)
		}
	}

	const handleProfileMenuToggle = () => {
		setShowProfileMenu(!showProfileMenu)
	}

	const handleMyTrips = () => {
		setShowProfileMenu(false)
		router.push('/my-trips')
	}

	const handleLogout = () => {
		setShowProfileMenu(false)
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Logout',
				onPress: async () => {
					try {
						await authService.logout()
						router.replace('/login' as any)
					} catch (error) {
						console.error('Logout error:', error)
						Alert.alert(
							'Error',
							'Failed to logout. Please try again.',
						)
					}
				},
			},
		])
	}

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#6366F1" />
					<Text style={styles.loadingText}>
						Loading your adventure...
					</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<TouchableWithoutFeedback onPress={() => setShowProfileMenu(false)}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					style={styles.scrollView}
				>
					{/* Header */}
					<View style={styles.header}>
						<View style={styles.headerContent}>
							<View>
								<Text style={styles.greeting}>
									Hello there! 👋
								</Text>
								{profile ? (
									<Text style={styles.userName}>
										{profile.name}
									</Text>
								) : (
									<Text style={styles.userName}>
										Traveler
									</Text>
								)}
							</View>
							<View style={styles.profileContainer}>
								<TouchableOpacity
									style={styles.profileButton}
									onPress={handleProfileMenuToggle}
								>
									<View style={styles.profileIcon}>
										<Text style={styles.profileIconText}>
											{profile?.name
												?.charAt(0)
												?.toUpperCase() || 'U'}
										</Text>
									</View>
								</TouchableOpacity>

								{showProfileMenu && (
									<View style={styles.profileMenu}>
										<TouchableOpacity
											style={styles.menuItem}
											onPress={handleMyTrips}
										>
											<Text style={styles.menuIcon}>
												📝
											</Text>
											<Text style={styles.menuText}>
												My Trips
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={styles.menuItem}
											onPress={handleSettings}
										>
											<Text style={styles.menuIcon}>
												⚙️
											</Text>
											<Text style={styles.menuText}>
												Settings
											</Text>
										</TouchableOpacity>
										<View style={styles.menuSeparator} />
										<TouchableOpacity
											style={styles.menuItem}
											onPress={handleLogout}
										>
											<Text style={styles.menuIcon}>
												🚪
											</Text>
											<Text style={styles.menuText}>
												Logout
											</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>
						</View>
					</View>

					{/* Hero Section */}
					<View style={styles.heroSection}>
						<LinearGradient
							colors={['#6366f1', '#8b5cf6']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.heroGradient}
						>
							<Text style={styles.heroTitle}>
								Ready for your next adventure?
							</Text>
							<Text style={styles.heroSubtitle}>
								Discover amazing destinations and create
								unforgettable memories
							</Text>
							<TouchableOpacity
								style={styles.primaryButton}
								onPress={() => {
									router.push('/create-trip' as any)
								}}
							>
								<Text style={styles.primaryButtonIcon}>✈️</Text>
								<Text style={styles.primaryButtonText}>
									Plan Your Trip
								</Text>
							</TouchableOpacity>
						</LinearGradient>
					</View>

					{/* Upcoming Visits */}
					{upcomingTrips.length > 0 && (
						<View style={styles.upcomingSection}>
							<View style={styles.sectionHeader}>
								<Text style={styles.sectionTitle}>
									Upcoming Visits
								</Text>
								<TouchableOpacity onPress={handleMyTrips}>
									<Text style={styles.seeAllText}>
										See all
									</Text>
								</TouchableOpacity>
							</View>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								style={styles.upcomingScroll}
							>
								{upcomingTrips.map((trip) => {
									// Format dates
									const startDate = new Date(trip.startDate)
									const endDate = new Date(trip.endDate)
									const formatDate = (date: Date) => {
										return date.toLocaleDateString(
											'en-US',
											{
												month: 'short',
												day: 'numeric',
											},
										)
									}

									return (
										<TouchableOpacity
											key={trip.id}
											style={styles.tripCard}
											onPress={() => {
												// Navigate to trip details
												Logger.log(
													'Navigate to trip details:',
													trip.id,
												)
											}}
										>
											<View style={styles.tripCardHeader}>
												<Text
													style={styles.tripCardTitle}
													numberOfLines={1}
												>
													{trip.firstDestination}
													{trip.totalDestinations >
														1 &&
														` → ${trip.lastDestination}`}
												</Text>
												<View style={styles.tripBadge}>
													<Text
														style={
															styles.tripBadgeText
														}
													>
														Upcoming
													</Text>
												</View>
											</View>

											<View
												style={styles.tripDateContainer}
											>
												<Text
													style={styles.tripDateText}
												>
													{formatDate(startDate)} -{' '}
													{formatDate(endDate)}
												</Text>
											</View>

											<View
												style={
													styles.tripStatsContainer
												}
											>
												<View style={styles.tripStat}>
													<Text
														style={
															styles.tripStatIcon
														}
													>
														📍
													</Text>
													<View>
														<Text
															style={
																styles.tripStatValue
															}
														>
															{
																trip.totalDestinations
															}
														</Text>
														<Text
															style={
																styles.tripStatLabel
															}
														>
															{trip.totalDestinations ===
															1
																? 'City'
																: 'Cities'}
														</Text>
													</View>
												</View>
												<View style={styles.tripStat}>
													<Text
														style={
															styles.tripStatIcon
														}
													>
														📅
													</Text>
													<View>
														<Text
															style={
																styles.tripStatValue
															}
														>
															{trip.totalDuration}
														</Text>
														<Text
															style={
																styles.tripStatLabel
															}
														>
															Days
														</Text>
													</View>
												</View>
												<View style={styles.tripStat}>
													<Text
														style={
															styles.tripStatIcon
														}
													>
														💰
													</Text>
													<View>
														<Text
															style={
																styles.tripStatValue
															}
														>
															${trip.totalBudget}
														</Text>
														<Text
															style={
																styles.tripStatLabel
															}
														>
															Budget
														</Text>
													</View>
												</View>
											</View>

											<View
												style={
													styles.tripRouteContainer
												}
											>
												<Text
													style={
														styles.tripRouteLabel
													}
												>
													Route
												</Text>
												<Text
													style={styles.tripRouteText}
													numberOfLines={1}
												>
													{trip.firstDestination}
													{trip.totalDestinations >
														1 &&
														` → ${trip.lastDestination}`}
													{trip.totalDestinations >
														2 &&
														` (+${
															trip.totalDestinations -
															2
														} more)`}
												</Text>
											</View>
										</TouchableOpacity>
									)
								})}
							</ScrollView>
						</View>
					)}

					{/* Featured Destinations */}
					<View style={styles.featuredSection}>
						<Text style={styles.sectionTitle}>
							Popular Destinations
						</Text>
						{popularCities.length > 0 ? (
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								style={styles.featuredScroll}
							>
								{popularCities.map((city, index) => {
									const gradientColors = [
										['#ff6b6b', '#ff8e53'],
										['#4ecdc4', '#44a08d'],
										['#667eea', '#764ba2'],
										['#f093fb', '#f5576c'],
										['#4facfe', '#00f2fe'],
										['#43e97b', '#38f9d7'],
										['#fa709a', '#fee140'],
										['#30cfd0', '#330867'],
									] as const
									const colors =
										gradientColors[
											index % gradientColors.length
										]
									return (
										<TouchableOpacity
											key={city.id}
											style={styles.featuredCard}
											onPress={() => {
												router.push(
													'/create-trip' as any,
												)
											}}
										>
											<LinearGradient
												colors={colors}
												start={{ x: 0, y: 0 }}
												end={{ x: 1, y: 1 }}
												style={
													styles.featuredCardGradient
												}
											>
												<Text
													style={
														styles.featuredCardTitle
													}
												>
													{city.name}
												</Text>
												<Text
													style={
														styles.featuredCardSubtitle
													}
												>
													{city.country.name}
												</Text>
											</LinearGradient>
										</TouchableOpacity>
									)
								})}
							</ScrollView>
						) : (
							<View style={styles.emptyState}>
								<Text style={styles.emptyStateText}>
									Loading destinations...
								</Text>
							</View>
						)}
					</View>

					<View style={styles.bottomSpacing} />
				</ScrollView>
			</TouchableWithoutFeedback>
		</SafeAreaView>
	)
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	scrollView: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f8f9fa',
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#6b7280',
		fontWeight: '500',
	},

	// Header Styles
	header: {
		paddingHorizontal: 24,
		paddingTop: 20,
		paddingBottom: 16,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#f1f5f9',
	},
	headerContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	greeting: {
		fontSize: 16,
		color: '#6b7280',
		marginBottom: 4,
	},
	userName: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1f2937',
	},
	profileContainer: {
		position: 'relative',
		zIndex: 1000,
	},
	profileButton: {
		padding: 4,
	},
	profileIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: '#6366f1',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	profileIconText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#fff',
	},
	profileMenu: {
		position: 'absolute',
		top: 52,
		right: 0,
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 8,
		minWidth: 160,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	menuIcon: {
		fontSize: 16,
		marginRight: 12,
		width: 20,
		textAlign: 'center',
	},
	menuText: {
		fontSize: 16,
		color: '#1f2937',
		fontWeight: '500',
	},
	menuSeparator: {
		height: 1,
		backgroundColor: '#f1f5f9',
		marginVertical: 4,
		marginHorizontal: 8,
	},

	// Hero Section Styles
	heroSection: {
		marginHorizontal: 24,
		marginTop: 24,
		marginBottom: 32,
	},
	heroGradient: {
		borderRadius: 20,
		padding: 32,
		alignItems: 'center',
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	heroTitle: {
		fontSize: 28,
		fontWeight: '800',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 12,
		letterSpacing: -0.5,
	},
	heroSubtitle: {
		fontSize: 16,
		color: '#e0e7ff',
		textAlign: 'center',
		marginBottom: 28,
		lineHeight: 24,
	},
	primaryButton: {
		backgroundColor: '#fff',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	primaryButtonIcon: {
		fontSize: 20,
		marginRight: 8,
	},
	primaryButtonText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#6366f1',
	},

	// Quick Actions Section
	quickActionsSection: {
		paddingHorizontal: 24,
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 16,
	},
	quickActionsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	quickActionCard: {
		width: (width - 72) / 2,
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 20,
		alignItems: 'center',
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	quickActionIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#f8fafc',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 12,
	},
	quickActionEmoji: {
		fontSize: 24,
	},
	quickActionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 4,
	},
	quickActionSubtitle: {
		fontSize: 12,
		color: '#6b7280',
	},

	// Upcoming Visits Section
	upcomingSection: {
		paddingLeft: 24,
		marginBottom: 32,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingRight: 24,
		marginBottom: 16,
	},
	seeAllText: {
		fontSize: 14,
		color: '#6366f1',
		fontWeight: '600',
	},
	upcomingScroll: {
		marginTop: 0,
	},
	tripCard: {
		width: 300,
		backgroundColor: '#fff',
		borderRadius: 20,
		marginRight: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 6,
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	tripCardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 16,
		gap: 8,
	},
	tripCardTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		flex: 1,
		lineHeight: 24,
	},
	tripBadge: {
		backgroundColor: '#dbeafe',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	tripBadgeText: {
		fontSize: 11,
		fontWeight: '600',
		color: '#1e40af',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	tripDateContainer: {
		marginBottom: 16,
	},
	tripDateText: {
		fontSize: 14,
		color: '#6366f1',
		fontWeight: '600',
	},
	tripStatsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
		paddingHorizontal: 8,
	},
	tripStat: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	tripStatIcon: {
		fontSize: 20,
	},
	tripStatValue: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1f2937',
		lineHeight: 20,
	},
	tripStatLabel: {
		fontSize: 11,
		color: '#6b7280',
		fontWeight: '500',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	tripRouteContainer: {
		backgroundColor: '#f8fafc',
		borderRadius: 12,
		padding: 12,
	},
	tripRouteLabel: {
		fontSize: 11,
		fontWeight: '600',
		color: '#6366f1',
		marginBottom: 6,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	tripRouteText: {
		fontSize: 14,
		color: '#4b5563',
		fontWeight: '500',
	},

	// Featured Section
	featuredSection: {
		paddingLeft: 24,
		marginBottom: 32,
	},
	featuredScroll: {
		marginTop: 16,
	},
	featuredCard: {
		width: 200,
		height: 120,
		borderRadius: 16,
		marginRight: 16,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	featuredCardGradient: {
		flex: 1,
		justifyContent: 'flex-end',
		padding: 16,
		borderRadius: 16,
	},
	featuredCardTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#fff',
		marginBottom: 4,
	},
	featuredCardSubtitle: {
		fontSize: 14,
		color: '#c7d2fe',
	},

	// Stats Section
	statsSection: {
		paddingHorizontal: 24,
		marginBottom: 32,
	},
	statsGrid: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
	},
	statCard: {
		flex: 1,
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 20,
		alignItems: 'center',
		marginHorizontal: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	statNumber: {
		fontSize: 28,
		fontWeight: '800',
		color: '#6366f1',
		marginBottom: 8,
	},
	statLabel: {
		fontSize: 12,
		color: '#6b7280',
		textAlign: 'center',
		fontWeight: '500',
	},

	emptyState: {
		paddingVertical: 40,
		alignItems: 'center',
	},
	emptyStateText: {
		fontSize: 14,
		color: '#6b7280',
	},

	bottomSpacing: {
		height: 40,
	},
})
