import { usePlaceholderColor } from '@/hooks/usePlaceholderColor'
import React from 'react'
import {
	StyleSheet,
	Text,
	TextInput,
	TextInputProps,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native'

interface SearchBarProps extends TextInputProps {
	onSearchPress?: () => void
	containerStyle?: ViewStyle
	variant?: 'default' | 'elevated' | 'filled'
	size?: 'small' | 'medium' | 'large'
}

export default function SearchBar({
	onSearchPress,
	containerStyle,
	variant = 'default',
	size = 'medium',
	placeholder = 'Search...',
	placeholderTextColor,
	...textInputProps
}: SearchBarProps) {
	const defaultPlaceholderColor = usePlaceholderColor()

	const containerStyles = [
		styles.container,
		styles[variant],
		styles[`${size}Size`],
		containerStyle,
	]

	const inputStyles = [styles.input, styles[`${size}Input`]]

	const buttonStyles = [styles.button, styles[`${size}Button`]]

	return (
		<View style={containerStyles}>
			<TextInput
				style={inputStyles}
				placeholder={placeholder}
				placeholderTextColor={
					placeholderTextColor ?? defaultPlaceholderColor
				}
				{...textInputProps}
			/>
			{onSearchPress && (
				<TouchableOpacity style={buttonStyles} onPress={onSearchPress}>
					<Text style={styles.searchIcon}>🔍</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 16,
		backgroundColor: '#fff',
	},

	// Variants
	default: {
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	elevated: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	filled: {
		backgroundColor: '#f8f9fa',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},

	// Sizes
	smallSize: {
		height: 40,
	},
	mediumSize: {
		height: 48,
	},
	largeSize: {
		height: 56,
	},

	input: {
		flex: 1,
		fontSize: 16,
		color: '#1f2937',
		paddingHorizontal: 16,
		paddingVertical: 0,
	},
	smallInput: {
		fontSize: 14,
		paddingHorizontal: 12,
	},
	mediumInput: {
		fontSize: 16,
		paddingHorizontal: 16,
	},
	largeInput: {
		fontSize: 18,
		paddingHorizontal: 20,
	},

	button: {
		backgroundColor: '#6366f1',
		justifyContent: 'center',
		alignItems: 'center',
		borderTopRightRadius: 16,
		borderBottomRightRadius: 16,
	},
	smallButton: {
		width: 40,
		height: 40,
		borderTopRightRadius: 12,
		borderBottomRightRadius: 12,
	},
	mediumButton: {
		width: 48,
		height: 48,
	},
	largeButton: {
		width: 56,
		height: 56,
		borderTopRightRadius: 20,
		borderBottomRightRadius: 20,
	},

	searchIcon: {
		fontSize: 18,
		color: '#fff',
	},
})
