import React, { ReactNode } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'

interface CardProps {
	children: ReactNode
	onPress?: () => void
	style?: ViewStyle
	variant?: 'default' | 'elevated' | 'outlined' | 'filled'
	padding?: 'none' | 'small' | 'medium' | 'large'
}

export default function Card({
	children,
	onPress,
	style,
	variant = 'default',
	padding = 'medium',
}: CardProps) {
	const cardStyle = [
		styles.base,
		styles[variant],
		styles[`${padding}Padding`],
		style,
	]

	if (onPress) {
		return (
			<TouchableOpacity
				style={cardStyle}
				onPress={onPress}
				activeOpacity={0.7}
			>
				{children}
			</TouchableOpacity>
		)
	}

	return <View style={cardStyle}>{children}</View>
}

const styles = StyleSheet.create({
	base: {
		borderRadius: 16,
		backgroundColor: '#fff',
	},

	// Variants
	default: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	elevated: {
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		borderWidth: 1,
		borderColor: '#f1f5f9',
	},
	outlined: {
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: '#e5e7eb',
	},
	filled: {
		backgroundColor: '#f8f9fa',
	},

	// Padding
	nonePadding: {
		padding: 0,
	},
	smallPadding: {
		padding: 12,
	},
	mediumPadding: {
		padding: 20,
	},
	largePadding: {
		padding: 32,
	},
})
