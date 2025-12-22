// Environment variables type declarations
declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production' | 'staging'
		EXPO_PUBLIC_NODE_ENV: 'development' | 'production' | 'staging'
		EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL: string
		EXPO_PUBLIC_USER_SERVICE_URL: string
		EXPO_PUBLIC_TRAVEL_SERVICE_URL: string
		EXPO_PUBLIC_API_TIMEOUT: string
		EXPO_PUBLIC_ENABLE_NETWORK_MONITOR?: 'true' | 'false'
	}
}
