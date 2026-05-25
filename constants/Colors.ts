/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const Colors = {
	light: {
		text: '#1f2937',
		background: '#fff',
		backgroundSecondary: '#f8f9fa',
		tint: '#6366f1',
		icon: '#6b7280',
		tabIconDefault: '#6b7280',
		tabIconSelected: '#6366f1',
		primary: '#6366f1',
		primaryLight: '#f0f4ff',
		secondary: '#e5e7eb',
		success: '#10b981',
		warning: '#f59e0b',
		error: '#ef4444',
		border: '#f1f5f9',
		shadow: '#000000',
		placeholder: '#475569',
	},
	dark: {
		text: '#f9fafb',
		background: '#1f2937',
		backgroundSecondary: '#374151',
		tint: '#818cf8',
		icon: '#d1d5db',
		tabIconDefault: '#d1d5db',
		tabIconSelected: '#818cf8',
		primary: '#818cf8',
		primaryLight: '#312e81',
		secondary: '#4b5563',
		success: '#34d399',
		warning: '#fbbf24',
		error: '#f87171',
		border: '#374151',
		shadow: '#000000',
		placeholder: '#cbd5f5',
	},
}

export const DAY_COLORS = [
	'#ef4444', // Day 1 - red
	'#3b82f6', // Day 2 - blue
	'#10b981', // Day 3 - green
	'#f59e0b', // Day 4 - amber
	'#8b5cf6', // Day 5 - purple
	'#ec4899', // Day 6 - pink
	'#14b8a6', // Day 7 - teal
	'#f97316', // Day 8 - orange
	'#6366f1', // Day 9 - indigo
	'#84cc16', // Day 10 - lime
]

export function getDayColor(dayNumber: number): string {
	const index = (dayNumber - 1) % DAY_COLORS.length
	return DAY_COLORS[index]
}

export default Colors
