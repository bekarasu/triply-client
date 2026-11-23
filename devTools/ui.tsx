import Colors from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export const C = Colors.light
export const MONO = 'SpaceMono'

export function IconButton({
	icon,
	label,
	onPress,
}: {
	icon: ComponentProps<typeof Ionicons>['name']
	label: string
	onPress: () => void
}) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			onPress={onPress}
			style={styles.iconButton}
		>
			<Ionicons name={icon} size={22} color={C.text} />
		</Pressable>
	)
}

export function TextButton({ title, onPress }: { title: string; onPress: () => void }) {
	return (
		<Pressable accessibilityRole="button" onPress={onPress} style={styles.textButton}>
			<Text style={styles.textButtonText}>{title}</Text>
		</Pressable>
	)
}

export function Segment<T extends string>({
	options,
	value,
	onChange,
}: {
	options: { value: T; label: string }[]
	value: T
	onChange: (value: T) => void
}) {
	return (
		<View style={styles.segment} accessibilityRole="tablist">
			{options.map((option) => {
				const selected = option.value === value
				return (
					<Pressable
						key={option.value}
						accessibilityRole="tab"
						accessibilityState={{ selected }}
						onPress={() => onChange(option.value)}
						style={[styles.segmentItem, selected && styles.segmentItemSelected]}
					>
						<Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
							{option.label}
						</Text>
					</Pressable>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	iconButton: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textButton: {
		minHeight: 44,
		paddingHorizontal: 12,
		justifyContent: 'center',
	},
	textButtonText: {
		color: C.primary,
		fontSize: 14,
		fontWeight: '600',
	},
	segment: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: C.secondary,
		borderRadius: 8,
		padding: 2,
	},
	segmentItem: {
		flex: 1,
		minHeight: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 6,
	},
	segmentItemSelected: {
		backgroundColor: C.background,
		boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
	},
	segmentText: {
		color: C.icon,
		fontSize: 13,
		fontWeight: '600',
	},
	segmentTextSelected: {
		color: C.primary,
	},
})
