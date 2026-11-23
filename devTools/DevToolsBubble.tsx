import { FloatingBubble } from '@/components/FloatingBubble'
import { useState } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { DevToolsTabs, leaveNetworkRequest } from './DevToolsTabs'
import { isFailure } from './networkFormat'
import { useNetworkLog } from './networkLogStore'
import { C, IconButton } from './ui'

export function DevToolsBubble() {
	const [open, setOpen] = useState(false)
	const { entries } = useNetworkLog()
	const close = () => setOpen(false)

	return (
		<>
			<FloatingBubble icon="flash" accessibilityLabel="Open dev tools" onPress={() => setOpen(true)}>
				{entries.length > 0 && (
					<View style={[styles.badge, entries.some(isFailure) && styles.badgeFailed]}>
						<Text style={styles.badgeText}>{entries.length > 99 ? '99+' : entries.length}</Text>
					</View>
				)}
			</FloatingBubble>
			<Modal
				visible={open}
				animationType="slide"
				// Android back: first leave the open request, then close the menu.
				onRequestClose={() => {
					if (!leaveNetworkRequest()) close()
				}}
			>
				{/* A Modal is its own native window, so it needs its own safe-area context. */}
				<SafeAreaProvider>
					<SafeAreaView style={styles.screen}>
						<View style={styles.header}>
							<Text style={styles.title}>Dev tools</Text>
							<IconButton icon="close" label="Close dev tools" onPress={close} />
						</View>
						<DevToolsTabs onClose={close} />
					</SafeAreaView>
				</SafeAreaProvider>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	badge: {
		position: 'absolute',
		top: -4,
		right: -4,
		minWidth: 20,
		height: 20,
		paddingHorizontal: 4,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: C.background,
		backgroundColor: C.text,
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'none',
	},
	badgeFailed: {
		backgroundColor: C.error,
	},
	badgeText: {
		color: '#ffffff',
		fontSize: 10,
		fontWeight: '700',
	},
	screen: {
		flex: 1,
		backgroundColor: C.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingLeft: 16,
		paddingRight: 4,
	},
	title: {
		fontSize: 20,
		fontWeight: '700',
		color: C.text,
	},
})
