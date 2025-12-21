import { Link, Stack, useRouter } from 'expo-router'
import {
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

export default function NotFoundScreen() {
	const router = useRouter()

	return (
		<>
			<Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
			<SafeAreaView style={styles.container}>
				<View style={styles.content}>
					<View style={styles.iconContainer}>
						<Text style={styles.icon}>🛣️</Text>
					</View>

					<Text style={styles.title}>Oops! Wrong Turn</Text>
					<Text style={styles.subtitle}>
						Looks like you&apos;ve wandered off the beaten path.
						Don&apos;t worry, every great traveler gets a bit lost
						sometimes!
					</Text>

					<TouchableOpacity
						style={styles.homeButton}
						onPress={() => router.replace('/home')}
					>
						<Text style={styles.homeButtonIcon}>🏠</Text>
						<Text style={styles.homeButtonText}>Back to Home</Text>
					</TouchableOpacity>

					<Link href="/" style={styles.link}>
						<Text style={styles.linkText}>
							Or explore from the beginning
						</Text>
					</Link>
				</View>
			</SafeAreaView>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	iconContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 32,
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 16,
		elevation: 8,
		borderWidth: 3,
		borderColor: '#e0e7ff',
	},
	icon: {
		fontSize: 64,
	},
	title: {
		fontSize: 32,
		fontWeight: '800',
		color: '#1f2937',
		textAlign: 'center',
		marginBottom: 16,
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: 18,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 26,
		marginBottom: 48,
		paddingHorizontal: 16,
	},
	homeButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#6366f1',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 16,
		marginBottom: 24,
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	homeButtonIcon: {
		fontSize: 20,
		marginRight: 12,
	},
	homeButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
	},
	link: {
		paddingVertical: 12,
	},
	linkText: {
		color: '#6366f1',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
	},
})
