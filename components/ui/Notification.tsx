import React from 'react'
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native'

interface NotificationProps {
	title: string
	message?: string
	type?: 'info' | 'success' | 'warning' | 'error'
	onDismiss?: () => void
	style?: ViewStyle
}

export default function Notification({
	title,
	message,
	type = 'info',
	onDismiss,
	style,
}: NotificationProps) {
	const notificationStyle = [styles.container, styles[type], style]

	const getIcon = () => {
		switch (type) {
			case 'success':
				return '✅'
			case 'warning':
				return '⚠️'
			case 'error':
				return '❌'
			default:
				return 'ℹ️'
		}
	}

	return (
		<View style={notificationStyle}>
			<View style={styles.content}>
				<Text style={styles.icon}>{getIcon()}</Text>
				<View style={styles.textContainer}>
					<Text style={[styles.title, styles[`${type}Title`]]}>
						{title}
					</Text>
					{message && (
						<Text
							style={[styles.message, styles[`${type}Message`]]}
						>
							{message}
						</Text>
					)}
				</View>
			</View>
			{onDismiss && (
				<TouchableOpacity
					style={styles.dismissButton}
					onPress={onDismiss}
				>
					<Text style={styles.dismissText}>✕</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
		borderRadius: 12,
		marginVertical: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	icon: {
		fontSize: 20,
		marginRight: 12,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 2,
	},
	message: {
		fontSize: 14,
		lineHeight: 20,
	},
	dismissButton: {
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	dismissText: {
		fontSize: 16,
		color: '#6b7280',
	},

	// Type variants
	info: {
		backgroundColor: '#f0f4ff',
		borderLeftWidth: 4,
		borderLeftColor: '#6366f1',
	},
	success: {
		backgroundColor: '#f0fdf4',
		borderLeftWidth: 4,
		borderLeftColor: '#10b981',
	},
	warning: {
		backgroundColor: '#fffbeb',
		borderLeftWidth: 4,
		borderLeftColor: '#f59e0b',
	},
	error: {
		backgroundColor: '#fef2f2',
		borderLeftWidth: 4,
		borderLeftColor: '#ef4444',
	},

	// Text colors for each type
	infoTitle: { color: '#6366f1' },
	infoMessage: { color: '#4338ca' },
	successTitle: { color: '#10b981' },
	successMessage: { color: '#047857' },
	warningTitle: { color: '#f59e0b' },
	warningMessage: { color: '#d97706' },
	errorTitle: { color: '#ef4444' },
	errorMessage: { color: '#dc2626' },
})
