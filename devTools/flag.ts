const env = process.env.EXPO_PUBLIC_NODE_ENV

// Release builds must be explicitly marked dev/staging, so a missing var never enables this in production.
export const devTools = __DEV__
	? env !== 'production'
	: env === 'development' || env === 'staging'
