import SearchBar from '@/components/ui/SearchBar'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { consoleLogStore, type LogEntry, type LogLevel, useConsoleLogs } from './consoleLogStore'
import { formatClock } from './networkFormat'
import { C, MONO, Segment, TextButton } from './ui'

type Filter = 'all' | 'warn' | 'error'

const LEVEL_COLOR: Record<LogLevel, string> = {
	debug: C.icon,
	log: C.text,
	info: C.primary,
	warn: C.warning,
	error: C.error,
}

export function DevLogsPanel() {
	const logs = useConsoleLogs()
	const [filter, setFilter] = useState<Filter>('all')
	const [query, setQuery] = useState('')

	const shown = useMemo(() => {
		const needle = query.trim().toLowerCase()
		return logs.filter(
			(entry) =>
				(filter === 'all' || entry.level === filter) &&
				(!needle || entry.message.toLowerCase().includes(needle)),
		)
	}, [logs, filter, query])

	const count = (level: LogLevel) => logs.filter((entry) => entry.level === level).length

	return (
		<View style={styles.flex}>
			<View style={styles.toolbar}>
				<Segment
					options={[
						{ value: 'all', label: `All ${logs.length}` },
						{ value: 'warn', label: `Warnings ${count('warn')}` },
						{ value: 'error', label: `Errors ${count('error')}` },
					]}
					value={filter}
					onChange={setFilter}
				/>
				<TextButton title="Clear" onPress={consoleLogStore.clear} />
			</View>
			<SearchBar
				size="small"
				variant="filled"
				placeholder="Search logs"
				value={query}
				onChangeText={setQuery}
				autoCapitalize="none"
				autoCorrect={false}
				containerStyle={styles.search}
			/>
			<FlatList
				data={shown}
				keyExtractor={(entry) => String(entry.id)}
				renderItem={({ item }) => <LogRow entry={item} />}
				// Reading further down: new logs don't shift the list. At the top: new logs show up.
				maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 40 }}
				keyboardShouldPersistTaps="handled"
				ListEmptyComponent={<Text style={styles.empty}>No logs</Text>}
			/>
		</View>
	)
}

function LogRow({ entry }: { entry: LogEntry }) {
	const [expanded, setExpanded] = useState(false)
	return (
		<Pressable
			onPress={() => setExpanded((value) => !value)}
			accessibilityState={{ expanded }}
			style={[
				styles.row,
				entry.level === 'warn' && styles.warnRow,
				entry.level === 'error' && styles.errorRow,
			]}
		>
			<View style={styles.rowHead}>
				<Text style={[styles.level, { color: LEVEL_COLOR[entry.level] }]}>
					{entry.level.toUpperCase()}
				</Text>
				<Text style={styles.time}>{formatClock(entry.at)}</Text>
			</View>
			<Text style={styles.message} numberOfLines={expanded ? undefined : 4} selectable={expanded}>
				{entry.message}
			</Text>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	toolbar: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	search: {
		marginHorizontal: 16,
		marginVertical: 8,
	},
	row: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: C.secondary,
		gap: 4,
	},
	warnRow: {
		backgroundColor: 'rgba(245,158,11,0.1)',
	},
	errorRow: {
		backgroundColor: 'rgba(239,68,68,0.1)',
	},
	rowHead: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	level: {
		fontSize: 11,
		fontWeight: '700',
	},
	time: {
		fontFamily: MONO,
		fontSize: 11,
		color: C.icon,
	},
	message: {
		fontFamily: MONO,
		fontSize: 12,
		color: C.text,
	},
	empty: {
		textAlign: 'center',
		color: C.icon,
		padding: 32,
	},
})
