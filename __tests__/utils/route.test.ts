import {
	decodePolyline,
	formatRouteDistance,
	formatRouteDuration,
} from '@/utils/route'

describe('decodePolyline', () => {
	it('decodes the reference polyline from the algorithm spec', () => {
		const result = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')

		expect(result).toHaveLength(3)
		expect(result[0].latitude).toBeCloseTo(38.5)
		expect(result[0].longitude).toBeCloseTo(-120.2)
		expect(result[1].latitude).toBeCloseTo(40.7)
		expect(result[1].longitude).toBeCloseTo(-120.95)
		expect(result[2].latitude).toBeCloseTo(43.252)
		expect(result[2].longitude).toBeCloseTo(-126.453)
	})

	it('supports a custom precision', () => {
		const result = decodePolyline('_izlhA~rlgdF', 6)

		expect(result).toHaveLength(1)
		expect(result[0].latitude).toBeCloseTo(38.5)
		expect(result[0].longitude).toBeCloseTo(-120.2)
	})

	it('returns an empty list for an empty string', () => {
		expect(decodePolyline('')).toEqual([])
	})

	it('ignores a trailing latitude without a longitude', () => {
		expect(decodePolyline('_p~iF')).toEqual([])
	})
})

describe('formatRouteDistance', () => {
	it('formats short distances in meters', () => {
		expect(formatRouteDistance(845.4)).toBe('845 m')
	})

	it('formats longer distances in kilometers', () => {
		expect(formatRouteDistance(1674)).toBe('1.7 km')
	})
})

describe('formatRouteDuration', () => {
	it('formats durations under an hour in minutes', () => {
		expect(formatRouteDuration(1339)).toBe('22 min')
	})

	it('rounds very short durations up to one minute', () => {
		expect(formatRouteDuration(10)).toBe('1 min')
	})

	it('formats whole hours without minutes', () => {
		expect(formatRouteDuration(7200)).toBe('2 h')
	})

	it('formats hours and minutes', () => {
		expect(formatRouteDuration(5400)).toBe('1 h 30 min')
	})
})
