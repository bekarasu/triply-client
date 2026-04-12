import { getStoreUrl } from '@/utils/store-links'

describe('trip-details store prompt', () => {
	it('selects the platform store URL', () => {
		expect(getStoreUrl('android')).toBe(
			'https://play.google.com/store/apps/details?id=com.bekarasu.triply',
		)
		expect(getStoreUrl('ios')).toBe(
			'https://apps.apple.com/us/search?term=Triply',
		)
	})
})
