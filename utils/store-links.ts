import { Platform } from 'react-native'

export const getStoreUrl = (platform: string = Platform.OS) => {
	if (platform === 'android') {
		return 'https://play.google.com/store/apps/details?id=com.bekarasu.triply'
	}

	return 'https://apps.apple.com/us/search?term=Triply'
}
