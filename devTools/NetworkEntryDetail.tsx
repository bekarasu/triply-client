import { useState } from 'react'
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native'
import { entryToText, formatBody, splitUrl, statusColor, statusLine } from './networkFormat'
import { type NetworkEntry, networkLogStore } from './networkLogStore'
import { C, IconButton, MONO, Segment } from './ui'

type Side = 'request' | 'response'

export function NetworkEntryDetail({ entry }: { entry: NetworkEntry }) {
	const [side, setSide] = useState<Side>('response')
	const headers = Object.entries(
		(side === 'request' ? entry.requestHeaders : entry.responseHeaders) ?? {},
	)
	const body = side === 'request' ? entry.requestBody : entry.responseBody
	const placeholder =
		body === ''
			? 'Empty'
			: side === 'response' && entry.state !== 'failed'
				? 'Waiting for response…'
				: 'None'

	const share = () => {
		Share.share({ message: entryToText(entry) }).catch((error) =>
			console.warn('Could not share request', error),
		)
	}

	return (
		<View style={styles.flex}>
			<View style={styles.header}>
				<IconButton icon="chevron-back" label="Back" onPress={() => networkLogStore.select(null)} />
				<Text style={styles.title} numberOfLines={1}>
					{entry.method} {splitUrl(entry.url).path}
				</Text>
				<IconButton icon="share-outline" label="Share request" onPress={share} />
			</View>
			<ScrollView contentContainerStyle={styles.content}>
				<Text selectable style={styles.url}>
					{entry.url}
				</Text>
				<Text style={[styles.meta, { color: statusColor(entry) }]}>{statusLine(entry)}</Text>
				{entry.error && (
					<Text selectable style={styles.error}>
						{entry.error}
					</Text>
				)}
				<View style={styles.segment}>
					<Segment
						options={[
							{ value: 'request', label: 'Request' },
							{ value: 'response', label: 'Response' },
						]}
						value={side}
						onChange={setSide}
					/>
				</View>
				<Text style={styles.section}>Headers ({headers.length})</Text>
				{headers.map(([key, value]) => (
					<Text key={key} selectable style={styles.code}>
						<Text style={styles.headerKey}>{key}</Text>: {value}
					</Text>
				))}
				<Text style={styles.section}>Body</Text>
				{body ? (
					<Text selectable style={styles.code}>
						{formatBody(body)}
					</Text>
				) : (
					<Text style={styles.placeholder}>{placeholder}</Text>
				)}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 4,
	},
	title: {
		flex: 1,
		fontFamily: MONO,
		fontSize: 14,
		fontWeight: '700',
		color: C.text,
	},
	content: {
		paddingHorizontal: 16,
		paddingBottom: 32,
		gap: 8,
	},
	url: {
		fontFamily: MONO,
		fontSize: 12,
		color: C.text,
	},
	meta: {
		fontSize: 13,
		fontWeight: '600',
	},
	error: {
		color: C.error,
		fontSize: 13,
	},
	segment: {
		flexDirection: 'row',
		marginVertical: 8,
	},
	section: {
		marginTop: 8,
		fontSize: 12,
		fontWeight: '700',
		color: C.icon,
		textTransform: 'uppercase',
	},
	code: {
		fontFamily: MONO,
		fontSize: 12,
		color: C.text,
	},
	headerKey: {
		fontWeight: '700',
	},
	placeholder: {
		fontSize: 13,
		color: C.icon,
		fontStyle: 'italic',
	},
})
