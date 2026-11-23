import Colors from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { type ComponentProps, type ReactNode, useMemo, useState } from 'react'
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SIZE = 48
const EDGE_GAP = 12
const TAP_SLOP = 4

interface FloatingBubbleProps {
	icon: ComponentProps<typeof Ionicons>['name']
	accessibilityLabel: string
	onPress: () => void
	color?: string
	/** Overlay such as a badge. */
	children?: ReactNode
}

export function FloatingBubble({
	icon,
	accessibilityLabel,
	onPress,
	color = Colors.light.primary,
	children,
}: FloatingBubbleProps) {
	const insets = useSafeAreaInsets()
	const [position] = useState(() => {
		const { width, height } = Dimensions.get('window')
		return new Animated.ValueXY({ x: width - SIZE - EDGE_GAP, y: height * 0.6 })
	})

	const responder = useMemo(() => {
		const snapToEdge = () => {
			position.flattenOffset()
			position.stopAnimation(({ x, y }) => {
				const { width, height } = Dimensions.get('window')
				Animated.spring(position, {
					toValue: {
						x:
							x + SIZE / 2 < width / 2
								? insets.left + EDGE_GAP
								: width - insets.right - SIZE - EDGE_GAP,
						y: Math.min(
							Math.max(y, insets.top + EDGE_GAP),
							height - insets.bottom - SIZE - EDGE_GAP,
						),
					},
					useNativeDriver: false,
				}).start()
			})
		}

		return PanResponder.create({
			// Small moves stay taps for the Pressable; only a real drag takes the touch away from it.
			onMoveShouldSetPanResponder: (_, gesture) =>
				Math.abs(gesture.dx) > TAP_SLOP || Math.abs(gesture.dy) > TAP_SLOP,
			onPanResponderGrant: () => {
				position.stopAnimation()
				position.extractOffset()
			},
			onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
				useNativeDriver: false,
			}),
			onPanResponderRelease: snapToEdge,
			onPanResponderTerminate: snapToEdge,
		})
	}, [position, insets])

	return (
		<Animated.View
			{...responder.panHandlers}
			style={[styles.bubble, { transform: position.getTranslateTransform() }]}
		>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				onPress={onPress}
				style={[styles.button, { backgroundColor: color }]}
			>
				<Ionicons name={icon} size={24} color="#ffffff" />
			</Pressable>
			{children}
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	bubble: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: SIZE,
		height: SIZE,
		zIndex: 1000,
		elevation: 8,
	},
	button: {
		flex: 1,
		borderRadius: SIZE / 2,
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0px 4px 16px rgba(99,102,241,0.3)',
	},
})
