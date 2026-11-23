import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useConsoleLogs } from './consoleLogStore'
import { DevLogsPanel } from './DevLogsPanel'
import { NetworkLogPanel } from './NetworkLogPanel'
import { networkLogStore, useNetworkLog } from './networkLogStore'
import { Segment } from './ui'

type Tab = 'logs' | 'network'

// Module level so reopening the menu lands on the last tab.
let lastTab: Tab = 'logs'

/** Closes the open request detail. Returns false when none was open. */
export function leaveNetworkRequest() {
	if (networkLogStore.get().selectedId === null) return false
	networkLogStore.select(null)
	return true
}

export function DevToolsTabs({ onClose }: { onClose: () => void }) {
	const [tab, setTab] = useState(lastTab)
	const logs = useConsoleLogs()
	const { entries } = useNetworkLog()

	const changeTab = (next: Tab) => {
		if (next !== 'network') leaveNetworkRequest()
		lastTab = next
		setTab(next)
	}

	return (
		<View style={styles.flex}>
			<View style={styles.tabs}>
				<Segment
					options={[
						{ value: 'logs', label: `Logs (${logs.length})` },
						{ value: 'network', label: `Network (${entries.length})` },
					]}
					value={tab}
					onChange={changeTab}
				/>
			</View>
			{/* Hidden instead of unmounted, so filters and search survive switching tabs. */}
			<View style={[styles.flex, tab !== 'logs' && styles.hidden]}>
				<DevLogsPanel />
			</View>
			<View style={[styles.flex, tab !== 'network' && styles.hidden]}>
				<NetworkLogPanel onClose={onClose} />
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	tabs: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingBottom: 8,
	},
	hidden: {
		display: 'none',
	},
})
