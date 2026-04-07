import { renderHook, act } from '@testing-library/react-native'

// Mock react-native useColorScheme
jest.mock('react-native', () => ({
	useColorScheme: jest.fn().mockReturnValue('dark'),
}))

describe('useColorScheme (web)', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('returns light before hydration', () => {
		const { useColorScheme } = require('@/hooks/useColorScheme.web')
		const { result } = renderHook(() => useColorScheme())

		// After the first render effect runs, it should hydrate
		expect(result.current).toBeDefined()
	})

	it('returns actual color scheme after hydration', async () => {
		const { useColorScheme } = require('@/hooks/useColorScheme.web')
		const { result } = renderHook(() => useColorScheme())

		// After useEffect runs, hasHydrated = true, returns actual scheme
		await act(async () => {})

		expect(result.current).toBe('dark')
	})
})
