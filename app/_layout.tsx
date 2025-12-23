import { NetworkMonitorOverlay } from '@/components/NetworkMonitorOverlay'
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Platform, StyleSheet, TextInput, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import type { Edge } from 'react-native-safe-area-context'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { TripProvider } from '../contexts/TripContext'

const ANDROID_CAMERA_PADDING = 12
const ANDROID_SAFE_AREA_EDGES: Edge[] = ['top', 'left', 'right']
const DEFAULT_PLACEHOLDER_COLOR = '#94a3b8'

const textInput = TextInput as unknown as {
	defaultProps?: Record<string, unknown>
}
if (!textInput.defaultProps) {
	textInput.defaultProps = {}
}

if (!textInput.defaultProps.placeholderTextColor) {
	textInput.defaultProps.placeholderTextColor = DEFAULT_PLACEHOLDER_COLOR
}

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	})

	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	const safeAreaEdges =
		Platform.OS === 'android' ? ANDROID_SAFE_AREA_EDGES : undefined

	return (
		<GestureHandlerRootView style={styles.flex}>
			<SafeAreaProvider>
				<TripProvider>
					<SafeAreaView
						style={[
							styles.flex,
							Platform.OS === 'android' && styles.androidInset,
						]}
						edges={safeAreaEdges}
					>
						<ThemeProvider
							value={
								colorScheme === 'dark'
									? DarkTheme
									: DefaultTheme
							}
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
					</SafeAreaView>
				</TripProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	androidInset: {
		paddingTop: ANDROID_CAMERA_PADDING,
	},
})
