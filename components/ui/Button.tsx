import React from 'react'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TextStyle,
	TouchableOpacity,
	ViewStyle,
} from 'react-native'

interface ButtonProps {
	title: string
	onPress: () => void
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
	size?: 'small' | 'medium' | 'large'
	loading?: boolean
	disabled?: boolean
	icon?: string
	style?: ViewStyle
	textStyle?: TextStyle
}

export default function Button({
	title,
	onPress,
	variant = 'primary',
	size = 'medium',
	loading = false,
	disabled = false,
	icon,
	style,
	textStyle,
}: ButtonProps) {
	const buttonStyle = [
		styles.base,
		styles[variant],
		styles[`${size}Size`],
		(disabled || loading) && styles.disabled,
		style,
	]

	const textStyleCombined = [
		styles.text,
		styles[`${variant}Text`],
		styles[`${size}Text`],
		(disabled || loading) && styles.disabledText,
		textStyle,
	]

	return (
		<TouchableOpacity
			style={buttonStyle}
			onPress={onPress}
			disabled={disabled || loading}
			activeOpacity={0.7}
		>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={variant === 'primary' ? '#fff' : '#6366f1'}
				/>
			) : (
				<>
					{icon && <Text style={styles.icon}>{icon}</Text>}
					<Text style={textStyleCombined}>{title}</Text>
				</>
			)}
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	base: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},

	// Variants
	primary: {
		backgroundColor: '#6366f1',
	},
	secondary: {
		backgroundColor: '#f1f5f9',
	},
	outline: {
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: '#6366f1',
	},
	ghost: {
		backgroundColor: 'transparent',
	},

	// Sizes
	smallSize: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	mediumSize: {
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	largeSize: {
		paddingHorizontal: 32,
		paddingVertical: 16,
	},

	// Text styles
	text: {
		fontWeight: '600',
		textAlign: 'center',
	},
	primaryText: {
		color: '#fff',
	},
	secondaryText: {
		color: '#1f2937',
	},
	outlineText: {
		color: '#6366f1',
	},
	ghostText: {
		color: '#6366f1',
	},

	// Text sizes
	smallText: {
		fontSize: 14,
	},
	mediumText: {
		fontSize: 16,
	},
	largeText: {
		fontSize: 18,
	},

	// Disabled styles
	disabled: {
		opacity: 0.5,
	},
	disabledText: {
		opacity: 0.7,
	},

	icon: {
		fontSize: 16,
		marginRight: 8,
	},
})
