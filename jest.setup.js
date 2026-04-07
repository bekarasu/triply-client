// Jest setup file
// Common mocks and setup for all tests

// Suppress react-test-renderer deprecation warning (React 19) — triggered by
// jest-expo's internal setup, not by our own tests.
const originalConsoleError = console.error
console.error = (...args) => {
	if (typeof args[0] === 'string' && args[0].includes('react-test-renderer')) {
		return
	}
	originalConsoleError(...args)
}

// Set up test environment variables
process.env.EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL =
	'http://localhost:3001/recommendation-service'
process.env.EXPO_PUBLIC_USER_SERVICE_URL = 'http://localhost:3002/user-service'
process.env.EXPO_PUBLIC_TRAVEL_SERVICE_URL =
	'http://localhost:3003/travel-service'
process.env.EXPO_PUBLIC_API_TIMEOUT = '10000'
process.env.EXPO_PUBLIC_NODE_ENV = 'development'

// Define React Native globals
global.__DEV__ = true

// Mock Logger — silence expected error logs from service catch blocks in tests
jest.mock('@/services/logger', () => ({
	Logger: {
		log: jest.fn(),
		error: jest.fn(),
	},
}))

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

// Mock expo-router
jest.mock('expo-router', () => ({
	router: {
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	},
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	}),
	useLocalSearchParams: () => ({}),
	useSegments: () => [],
}))

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
	impactAsync: jest.fn(),
	notificationAsync: jest.fn(),
	selectionAsync: jest.fn(),
	ImpactFeedbackStyle: {
		Light: 'light',
		Medium: 'medium',
		Heavy: 'heavy',
	},
	NotificationFeedbackType: {
		Success: 'success',
		Warning: 'warning',
		Error: 'error',
	},
}))

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
	LinearGradient: 'LinearGradient',
}))

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
	default: {
		call: () => {},
	},
	useAnimatedStyle: () => ({}),
	useSharedValue: (val) => ({ value: val }),
	withTiming: (val) => val,
	withSpring: (val) => val,
	Easing: {
		linear: (val) => val,
		ease: (val) => val,
	},
}))

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
	PanGestureHandler: 'PanGestureHandler',
	TapGestureHandler: 'TapGestureHandler',
	State: {},
	gestureHandlerRootHOC: (component) => component,
	GestureHandlerRootView: ({ children }) => children,
}))

// Mock react-native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
	alert: jest.fn(),
}))

// Silence console warnings in tests (optional - uncomment if needed)
// global.console.warn = jest.fn()

// Set up global fetch mock (can be overridden in individual tests)
global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({}),
		headers: new Headers(),
	}),
)

// Mock Date.now for consistent timestamps in tests when needed
const originalDateNow = Date.now
beforeEach(() => {
	// Reset fetch mock before each test
	jest.clearAllMocks()
})
