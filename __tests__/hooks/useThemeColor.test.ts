import { renderHook } from '@testing-library/react-native'
import { useColorScheme } from 'react-native'
import { useThemeColor } from '@/hooks/useThemeColor'

// Mock react-native
jest.mock('react-native', () => ({
	useColorScheme: jest.fn(),
}))

// Mock Colors from react-native NewAppScreen
jest.mock('react-native/Libraries/NewAppScreen', () => ({
	Colors: {
		light: {
			primary: '#000000',
			background: '#ffffff',
		},
		dark: {
			primary: '#ffffff',
			background: '#000000',
		},
	},
}))

describe('useThemeColor', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('returns color from props when provided for light theme', () => {
		;(useColorScheme as jest.Mock).mockReturnValue('light')

		const { result } = renderHook(() =>
			useThemeColor({ light: '#ff0000' }, 'primary'),
		)

		expect(result.current).toBe('#ff0000')
	})

	it('returns color from props when provided for dark theme', () => {
		;(useColorScheme as jest.Mock).mockReturnValue('dark')

		const { result } = renderHook(() =>
			useThemeColor({ dark: '#00ff00' }, 'primary'),
		)

		expect(result.current).toBe('#00ff00')
	})

	it('falls back to Colors constant when no prop for current theme', () => {
		;(useColorScheme as jest.Mock).mockReturnValue('light')

		const { result } = renderHook(() =>
			useThemeColor({}, 'primary'),
		)

		expect(result.current).toBe('#000000')
	})

	it('falls back to Colors constant for dark theme', () => {
		;(useColorScheme as jest.Mock).mockReturnValue('dark')

		const { result } = renderHook(() =>
			useThemeColor({}, 'background'),
		)

		expect(result.current).toBe('#000000')
	})

	it('defaults to light theme when useColorScheme returns null', () => {
		;(useColorScheme as jest.Mock).mockReturnValue(null)

		const { result } = renderHook(() =>
			useThemeColor({}, 'primary'),
		)

		expect(result.current).toBe('#000000')
	})
})
