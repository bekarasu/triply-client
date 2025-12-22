import { NetworkMonitorOverlay } from '@/components/NetworkMonitorOverlay'
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { TripProvider } from '../contexts/TripContext'

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	})

	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<TripProvider>
				<ThemeProvider
					value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
				>
					<Stack
						screenOptions={{
							headerShown: false,
						}}
						initialRouteName="onboarding-1"
					>
						<Stack.Screen name="onboarding-1" />
						<Stack.Screen name="onboarding-2" />
						<Stack.Screen name="onboarding-3" />
						<Stack.Screen name="login" />
						<Stack.Screen name="signup" />
						<Stack.Screen name="verify-otp" />
						<Stack.Screen name="home" />
						<Stack.Screen name="my-trips" />
						<Stack.Screen name="create-trip" />
						<Stack.Screen name="trip-details" />
						<Stack.Screen name="+not-found" />
					</Stack>
					<StatusBar style="auto" />
					<NetworkMonitorOverlay />
				</ThemeProvider>
			</TripProvider>
		</GestureHandlerRootView>
	)
}
