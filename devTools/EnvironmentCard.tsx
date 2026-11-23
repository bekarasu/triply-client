import { ENV_CONFIG } from '@/utils/env-config'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { C, MONO } from './ui'

const SERVICES = [
	['User', ENV_CONFIG.USER_SERVICE_URL],
	['Travel', ENV_CONFIG.TRAVEL_SERVICE_URL],
	['Recommendation', ENV_CONFIG.RECOMMENDATION_SERVICE_URL],
] as const

// Only what the app knows at runtime: there's no env file name, commit or build time injected into the bundle.
export function EnvironmentCard() {
	const [expanded, setExpanded] = useState(false)
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ expanded }}
			onPress={() => setExpanded((value) => !value)}
			style={styles.card}
		>
			<View style={styles.summary}>
				<Text style={styles.summaryText}>
					{ENV_CONFIG.NODE_ENV} · {__DEV__ ? 'Debug' : 'Release'}
				</Text>
				<Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={C.icon} />
			</View>
			{expanded &&
				SERVICES.map(([name, url]) => (
					<Text key={name} selectable style={styles.detail}>
						{name}: {url}
					</Text>
				))}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	card: {
		marginHorizontal: 16,
		marginBottom: 8,
		padding: 12,
		minHeight: 44,
		borderRadius: 8,
		backgroundColor: C.backgroundSecondary,
		gap: 4,
	},
	summary: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	summaryText: {
		color: C.text,
		fontSize: 13,
		fontWeight: '600',
	},
	detail: {
		fontFamily: MONO,
		fontSize: 11,
		color: C.icon,
	},
})
