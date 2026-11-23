import SearchBar from '@/components/ui/SearchBar'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { EnvironmentCard } from './EnvironmentCard'
import {
	formatClock,
	formatDuration,
	splitUrl,
	statusColor,
	statusLabel,
} from './networkFormat'
import { NetworkEntryDetail } from './NetworkEntryDetail'
import { type NetworkEntry, networkLogStore, useNetworkLog } from './networkLogStore'
import { C, IconButton, MONO, TextButton } from './ui'

export function NetworkLogPanel({ onClose }: { onClose: () => void }) {
	const { entries, selectedId } = useNetworkLog()
	const [query, setQuery] = useState('')

	const shown = useMemo(() => {
		const needle = query.trim().toLowerCase()
		if (!needle) return entries
		return entries.filter((entry) =>
			`${entry.method} ${entry.url} ${statusLabel(entry)}`.toLowerCase().includes(needle),
		)
	}, [entries, query])

	// Resolved from the live store on every render, so a response body that arrives later shows up.
	const selected = entries.find((entry) => entry.id === selectedId)
	if (selected) return <NetworkEntryDetail entry={selected} />

	return (
		<View style={styles.flex}>
			<View style={styles.header}>
				<Text style={styles.title}>Network</Text>
				<TextButton title="Clear" onPress={networkLogStore.clear} />
				<IconButton icon="close" label="Close dev tools" onPress={onClose} />
			</View>
			<EnvironmentCard />
			<SearchBar
				size="small"
				variant="filled"
				placeholder="Search URL, method or status"
				value={query}
				onChangeText={setQuery}
				autoCapitalize="none"
				autoCorrect={false}
				containerStyle={styles.search}
			/>
			<FlatList
				data={shown}
				keyExtractor={(entry) => String(entry.id)}
				renderItem={({ item }) => <RequestRow entry={item} />}
				keyboardShouldPersistTaps="handled"
				ListEmptyComponent={<Text style={styles.empty}>No requests</Text>}
			/>
		</View>
	)
}

function RequestRow({ entry }: { entry: NetworkEntry }) {
	const { host, path } = splitUrl(entry.url)
	return (
		<Pressable
			accessibilityRole="button"
			onPress={() => networkLogStore.select(entry.id)}
			style={styles.row}
		>
			<View style={styles.rowHead}>
				<Text style={styles.method}>{entry.method}</Text>
				<Text style={[styles.status, { color: statusColor(entry) }]}>{statusLabel(entry)}</Text>
				<Text style={styles.path} numberOfLines={1}>
					{path}
				</Text>
			</View>
			<Text style={styles.meta} numberOfLines={1}>
				{[host, formatClock(entry.startedAt), formatDuration(entry.durationMs)]
					.filter(Boolean)
					.join(' · ')}
			</Text>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 16,
		paddingRight: 4,
	},
	title: {
		flex: 1,
		fontSize: 17,
		fontWeight: '700',
		color: C.text,
	},
	search: {
		marginHorizontal: 16,
		marginBottom: 8,
	},
	row: {
		minHeight: 44,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: C.secondary,
		gap: 2,
	},
	rowHead: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	method: {
		fontFamily: MONO,
		fontSize: 12,
		fontWeight: '700',
		color: C.text,
	},
	status: {
		fontFamily: MONO,
		fontSize: 12,
		fontWeight: '700',
	},
	path: {
		flex: 1,
		fontFamily: MONO,
		fontSize: 12,
		color: C.text,
	},
	meta: {
		fontSize: 11,
		color: C.icon,
	},
	empty: {
		textAlign: 'center',
		color: C.icon,
		padding: 32,
	},
})
