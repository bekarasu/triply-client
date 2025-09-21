import React, { useEffect, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { authService } from '@/services/auth-service'
import { User } from '@/services/auth-types'

export default function HomeScreen() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		loadUserData()
	}, [])

	const loadUserData = async () => {
		try {
			const userData = await authService.getStoredUserData()
			setUser(userData)
		} catch (error) {
			console.error('Error loading user data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleLogout = () => {
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
				<View style={styles.content}>
					<ActivityIndicator size="large" color="#007AFF" />
					<Text style={styles.loadingText}>Loading...</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.logoutButton}
					onPress={handleLogout}
				>
					<Text style={styles.logoutButtonText}>Logout</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.content}>
				<Text style={styles.title}>Welcome to Triply</Text>
				{user ? (
					<View style={styles.userInfo}>
						<Text style={styles.welcomeText}>
							Hello, {user.firstName} {user.lastName}!
						</Text>
						<Text style={styles.emailText}>{user.email}</Text>
					</View>
				) : (
					<Text style={styles.subtitle}>
						You are successfully logged in!
					</Text>
				)}

				<View style={styles.featuresContainer}>
					<Text style={styles.featuresTitle}>Coming Soon:</Text>
					<Text style={styles.featureItem}>
						🗺️ Discover amazing places
					</Text>
					<Text style={styles.featureItem}>
						✈️ Plan your perfect trip
					</Text>
					<Text style={styles.featureItem}>
						🌟 Share your experiences
					</Text>
				</View>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		padding: 20,
		paddingTop: 10,
	},
	logoutButton: {
		backgroundColor: '#ff4444',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 6,
	},
	logoutButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
	},
	content: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#666',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#333',
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
	userInfo: {
		alignItems: 'center',
		marginBottom: 40,
	},
	welcomeText: {
		fontSize: 20,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
		textAlign: 'center',
	},
	emailText: {
		fontSize: 16,
		color: '#666',
	},
	featuresContainer: {
		alignItems: 'center',
		marginTop: 40,
	},
	featuresTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		marginBottom: 16,
	},
	featureItem: {
		fontSize: 16,
		color: '#666',
		marginBottom: 8,
		textAlign: 'center',
	},
})
