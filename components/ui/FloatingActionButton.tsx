import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native'

interface FloatingActionButtonProps {
	onPress: () => void
	icon?: string
	size?: 'small' | 'medium' | 'large'
	colors?: readonly [string, string, ...string[]]
	style?: ViewStyle
}

export default function FloatingActionButton({
	onPress,
	icon = '✈️',
	size = 'medium',
	colors = ['#6366f1', '#8b5cf6'],
	style,
}: FloatingActionButtonProps) {
	const buttonSize = {
		small: 48,
		medium: 56,
		large: 64,
	}[size]

	const iconSize = {
		small: 20,
		medium: 24,
		large: 28,
	}[size]

	const fabStyle = [
		styles.fab,
		{ width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
		style,
	]

	return (
		<TouchableOpacity
			style={fabStyle}
			onPress={onPress}
			activeOpacity={0.8}
		>
			<LinearGradient
				colors={colors}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.gradient}
			>
				<Text style={[styles.icon, { fontSize: iconSize }]}>
					{icon}
				</Text>
			</LinearGradient>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		bottom: 24,
		right: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
		zIndex: 1000,
	},
	gradient: {
		width: '100%',
		height: '100%',
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	icon: {
		color: '#fff',
	},
})
