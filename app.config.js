// Extends app.json with values that come from the environment instead of git.
// Google Maps needs an API key on Android only; iOS renders with Apple Maps.
module.exports = ({ config }) => ({
	...config,
	plugins: [
		...config.plugins,
		[
			'react-native-maps',
			{
				androidGoogleMapsApiKey:
					process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
			},
		],
	],
})
