import Colors from '@/constants/Colors'
import { useColorScheme } from 'react-native'

const DEFAULT_SCHEME = 'light'

type ColorScheme = keyof typeof Colors

export function usePlaceholderColor(): string {
	const colorScheme = (useColorScheme() ?? DEFAULT_SCHEME) as ColorScheme
	const palette = Colors[colorScheme] ?? Colors[DEFAULT_SCHEME]

	return palette.placeholder
}
