import { ENV_CONFIG } from '../utils/env-config'

// Environment-based service URLs
const SERVICE_BASE_URL = {
	RECOMMENDATION: ENV_CONFIG.RECOMMENDATION_SERVICE_URL,
	USER: ENV_CONFIG.USER_SERVICE_URL,
	TRAVEL: ENV_CONFIG.TRAVEL_SERVICE_URL,
}

// Environment-based API configuration
export const API_CONFIG = {
	ENDPOINTS: {
		AUTH: {
			LOGIN: (provider: string) =>
				`${SERVICE_BASE_URL.USER}/authentication/${provider}/login`,
			PRE_REGISTER: `${SERVICE_BASE_URL.USER}/authentication/triply/pre-register`,
			VERIFY_OTP: `${SERVICE_BASE_URL.USER}/authentication/verify-otp`,
			RESEND_OTP: `${SERVICE_BASE_URL.USER}/authentication/resend-otp`,
		},
	},
	TIMEOUT: ENV_CONFIG.API_TIMEOUT,
	// Environment info for debugging
	ENVIRONMENT: ENV_CONFIG.NODE_ENV,
	// Expose service URLs for debugging
	SERVICE_URLS: SERVICE_BASE_URL,
}
