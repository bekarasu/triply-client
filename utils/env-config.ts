/**
 * Environment configuration utility
 * Provides a centralized way to access environment variables with validation
 */

export type Environment = 'development' | 'staging' | 'production'

const NODE_ENV =
	(process.env.EXPO_PUBLIC_NODE_ENV as Environment) || 'development'

const ENABLE_NETWORK_MONITOR =
	process.env.EXPO_PUBLIC_ENABLE_NETWORK_MONITOR !== undefined
		? process.env.EXPO_PUBLIC_ENABLE_NETWORK_MONITOR === 'true'
		: NODE_ENV !== 'production'

export const ENV_CONFIG = {
	// Current environment
	NODE_ENV,

	// Service URLs
	RECOMMENDATION_SERVICE_URL:
		process.env.EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL ||
		'http://localhost:3001/recommendation-service',
	USER_SERVICE_URL:
		process.env.EXPO_PUBLIC_USER_SERVICE_URL ||
		'http://localhost:3002/user-service',
	TRAVEL_SERVICE_URL:
		process.env.EXPO_PUBLIC_TRAVEL_SERVICE_URL ||
		'http://localhost:3003/travel-service',

	// API Configuration
	API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 10000,
	ENABLE_NETWORK_MONITOR,

	// Validation
	validate: () => {
		const requiredVars = [
			'EXPO_PUBLIC_RECOMMENDATION_SERVICE_URL',
			'EXPO_PUBLIC_USER_SERVICE_URL',
			'EXPO_PUBLIC_TRAVEL_SERVICE_URL',
		]

		const missing = requiredVars.filter((varName) => !process.env[varName])

		if (missing.length > 0) {
			console.warn(`Missing environment variables: ${missing.join(', ')}`)
			console.warn('Using default values for missing variables')
		}

		return missing.length === 0
	},
}

// Environment checks
export const isDevelopment = () => ENV_CONFIG.NODE_ENV === 'development'
export const isStaging = () => ENV_CONFIG.NODE_ENV === 'staging'
export const isProduction = () => ENV_CONFIG.NODE_ENV === 'production'
export const isNetworkMonitorEnabled = () =>
	ENV_CONFIG.ENABLE_NETWORK_MONITOR === true

// Validate environment on import
ENV_CONFIG.validate()
