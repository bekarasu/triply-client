import { authService } from '@/services/auth/service'
import { profileService } from '@/services/profile/service'
import { Profile } from '@/services/profile/types'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

export default function HomeScreen() {
	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		loadUserData()
	}, [])

	// TODO send request every app launch to refresh user data
	const loadUserData = async () => {
		try {
			const profileData = await profileService.getStoredData()
			setProfile(profileData)
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
				{profile ? (
					<Text style={styles.title}>Welcome {profile.name}!</Text>
				) : (
					<Text style={styles.subtitle}>Welcome</Text>
				)}

				<TouchableOpacity
					style={styles.planTripButton}
					onPress={() => {
						router.push('/create-trip' as any)
					}}
				>
					<Text style={styles.planTripButtonText}>
						Plan Your Trip
					</Text>
				</TouchableOpacity>
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
	planTripButton: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
		marginTop: 32,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	planTripButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
	},
})
