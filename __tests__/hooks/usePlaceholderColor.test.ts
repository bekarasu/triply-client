import { renderHook } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import { usePlaceholderColor } from '@/hooks/usePlaceholderColor'
import Colors from '@/constants/Colors'

// Mock react-native useColorScheme
jest.mock('react-native', () => ({
	useColorScheme: jest.fn(),
}))

describe('usePlaceholderColor', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('returns light theme placeholder color when color scheme is light', () => {
		;(useColorScheme as jest.Mock).mockReturnValue('light')

		const { result } = renderHook(() => usePlaceholderColor())

		expect(result.current).toBe(Colors.light.placeholder)
	})

	it('returns dark theme placeholder color when color scheme is dark', () => {
		;(useColorScheme as jest.Mock).mockReturnValue('dark')

		const { result } = renderHook(() => usePlaceholderColor())

		expect(result.current).toBe(Colors.dark.placeholder)
	})

	it('returns light theme placeholder color when color scheme is null', () => {
		;(useColorScheme as jest.Mock).mockReturnValue(null)

		const { result } = renderHook(() => usePlaceholderColor())

		expect(result.current).toBe(Colors.light.placeholder)
	})

	it('returns light theme placeholder color when color scheme is undefined', () => {
		;(useColorScheme as jest.Mock).mockReturnValue(undefined)

		const { result } = renderHook(() => usePlaceholderColor())

		expect(result.current).toBe(Colors.light.placeholder)
	})

	it('falls back to light theme when Colors does not have the scheme key', () => {
		// Return a non-standard scheme that won't exist in Colors
		;(useColorScheme as jest.Mock).mockReturnValue('highContrast')

		const { result } = renderHook(() => usePlaceholderColor())

		// Should fall back to light theme via ?? operator
		expect(result.current).toBe(Colors.light.placeholder)
	})
})
