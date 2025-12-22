import { NetworkLogEntry, networkMonitor } from '@/services/network-monitor'
import { isNetworkMonitorEnabled } from '@/utils/env-config'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useMemo, useState } from 'react'
import {
	FlatList,
	Modal,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

const stateColors: Record<string, string> = {
	success: '#22c55e',
	error: '#ef4444',
	pending: '#f59e0b',
}

const methodColors: Record<string, string> = {
	GET: '#6366f1',
	POST: '#ec4899',
	PUT: '#f97316',
	DELETE: '#ef4444',
	PATCH: '#14b8a6',
}

const formatJSON = (value: any) => {
	if (value === undefined) {
		return '—'
	}

	if (typeof value === 'string') {
		return value
	}

	try {
		return JSON.stringify(value, null, 2)
	} catch (error) {
		return '[unserializable payload]'
	}
}

export function NetworkMonitorOverlay() {
	const isEnabled = isNetworkMonitorEnabled()
	const [visible, setVisible] = useState(false)
	const [entries, setEntries] = useState<NetworkLogEntry[]>(
		isEnabled ? networkMonitor.getLogs() : [],
	)
	const [expandedId, setExpandedId] = useState<string | null>(null)

	useEffect(() => {
		if (!isEnabled) {
			setVisible(false)
			setEntries([])
			setExpandedId(null)
			return
		}

		const unsubscribe = networkMonitor.subscribe((logs) => {
			setEntries(logs)
			if (logs.length === 0) {
				setExpandedId(null)
			}
		})

		return unsubscribe
	}, [isEnabled])

	const emptyState = useMemo(
		() => (
			<View style={styles.emptyStateContainer}>
				<Text style={styles.emptyStateEmoji}>📡</Text>
				<Text style={styles.emptyStateTitle}>No traffic yet</Text>
				<Text style={styles.emptyStateSubtitle}>
					Keep using the app to capture outgoing requests and
					responses.
				</Text>
			</View>
		),
		[],
	)

	if (!isEnabled) {
		return null
	}

	return (
		<>
			<View pointerEvents="box-none" style={styles.fabContainer}>
				<TouchableOpacity
					style={styles.fab}
					onPress={() => setVisible(true)}
					activeOpacity={0.85}
				>
					<Ionicons name="pulse-outline" size={26} color="#f8fafc" />
				</TouchableOpacity>
			</View>
			<Modal
				visible={visible}
				animationType="slide"
				transparent
				statusBarTranslucent
				onRequestClose={() => setVisible(false)}
			>
				<View style={styles.modalBackdrop}>
					<SafeAreaView style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<View>
								<Text style={styles.title}>
									Network Monitor
								</Text>
								<Text style={styles.subtitle}>
									Live capture of every request made through
									the client.
								</Text>
							</View>
							<View style={styles.modalActions}>
								<TouchableOpacity
									style={styles.clearButton}
									onPress={() => networkMonitor.clear()}
								>
									<Text style={styles.clearButtonText}>
										Clear
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.closeButton}
									onPress={() => setVisible(false)}
								>
									<Ionicons
										name="close"
										size={20}
										color="#f1f5f9"
									/>
								</TouchableOpacity>
							</View>
						</View>

						<FlatList
							data={entries}
							keyExtractor={(item) => item.id}
							style={styles.list}
							ListEmptyComponent={emptyState}
							renderItem={({ item }) => {
								const stateColor =
									stateColors[item.state] || '#9ca3af'
								const methodColor =
									methodColors[item.method] ||
									methodColors.GET
								const isExpanded = expandedId === item.id
								const startedAt = new Date(item.startedAt)

								return (
									<TouchableOpacity
										style={[
											styles.card,
											{ borderColor: stateColor },
										]}
										onPress={() =>
											setExpandedId((prev) =>
												prev === item.id
													? null
													: item.id,
											)
										}
									>
										<View style={styles.cardHeader}>
											<View
												style={
													styles.methodBadgeWrapper
												}
											>
												<View
													style={[
														styles.methodBadge,
														{
															backgroundColor:
																methodColor,
														},
													]}
												>
													<Text
														style={
															styles.methodBadgeText
														}
													>
														{item.method}
													</Text>
												</View>
											</View>
											<View style={styles.urlContainer}>
												<Text
													style={styles.urlText}
													numberOfLines={2}
												>
													{item.url}
												</Text>
												<Text style={styles.metaText}>
													{startedAt.toLocaleTimeString()}{' '}
													·{' '}
													{item.durationMs
														? `${item.durationMs} ms`
														: 'pending'}
												</Text>
											</View>
											<View>
												<Text
													style={[
														styles.statusText,
														{ color: stateColor },
													]}
												>
													{item.statusCode || '—'}
												</Text>
											</View>
										</View>

										{isExpanded && (
											<View
												style={styles.detailsContainer}
											>
												<DetailBlock
													label="Request Headers"
													value={item.requestHeaders}
												/>
												<DetailBlock
													label="Request Body"
													value={item.requestBody}
												/>
												<DetailBlock
													label="Response Headers"
													value={item.responseHeaders}
												/>
												<DetailBlock
													label="Response Body"
													value={item.responseBody}
												/>
												{item.errorMessage && (
													<View
														style={styles.errorChip}
													>
														<Text
															style={
																styles.errorChipText
															}
														>
															{item.errorMessage}
														</Text>
													</View>
												)}
											</View>
										)}
									</TouchableOpacity>
								)
							}}
						/>
					</SafeAreaView>
				</View>
			</Modal>
		</>
	)
}

interface DetailBlockProps {
	label: string
	value: any
}

const DetailBlock = ({ label, value }: DetailBlockProps) => {
	return (
		<View style={styles.detailBlock}>
			<Text style={styles.detailLabel}>{label}</Text>
			<View style={styles.detailContent}>
				<ScrollView horizontal>
					<Text style={styles.codeText}>{formatJSON(value)}</Text>
				</ScrollView>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	fabContainer: {
		position: 'absolute',
		bottom: 28,
		right: 20,
		zIndex: 999,
		pointerEvents: 'box-none',
	},
	fab: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#5b21b6',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(2, 6, 23, 0.85)',
		justifyContent: 'flex-end',
	},
	modalCard: {
		backgroundColor: '#020617',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 24,
		height: '85%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
		gap: 12,
	},
	modalActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	title: {
		fontSize: 20,
		fontWeight: '600',
		color: '#f8fafc',
	},
	subtitle: {
		fontSize: 13,
		color: '#94a3b8',
		marginTop: 2,
	},
	clearButton: {
		borderColor: '#475569',
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
	},
	clearButtonText: {
		color: '#f1f5f9',
		fontWeight: '500',
	},
	closeButton: {
		backgroundColor: 'rgba(148, 163, 184, 0.2)',
		borderRadius: 999,
		padding: 8,
	},
	list: {
		flex: 1,
	},
	card: {
		borderWidth: 1,
		borderRadius: 16,
		padding: 14,
		backgroundColor: '#0f172a',
		marginBottom: 12,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	methodBadgeWrapper: {
		paddingRight: 8,
	},
	methodBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	methodBadgeText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 12,
	},
	urlContainer: {
		flex: 1,
		gap: 4,
	},
	urlText: {
		color: '#f8fafc',
		fontSize: 14,
		fontWeight: '500',
	},
	metaText: {
		color: '#94a3b8',
		fontSize: 12,
	},
	statusText: {
		fontSize: 16,
		fontWeight: '700',
	},
	detailsContainer: {
		marginTop: 12,
		gap: 12,
	},
	detailBlock: {
		gap: 6,
	},
	detailLabel: {
		color: '#94a3b8',
		fontSize: 12,
		textTransform: 'uppercase',
		letterSpacing: 0.8,
	},
	detailContent: {
		backgroundColor: '#020617',
		borderRadius: 8,
		padding: 10,
	},
	codeText: {
		color: '#e2e8f0',
		fontFamily: 'SpaceMono',
		fontSize: 12,
	},
	emptyStateContainer: {
		alignItems: 'center',
		paddingVertical: 60,
		gap: 12,
	},
	emptyStateEmoji: {
		fontSize: 42,
	},
	emptyStateTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#f8fafc',
	},
	emptyStateSubtitle: {
		fontSize: 14,
		color: '#94a3b8',
		textAlign: 'center',
		paddingHorizontal: 24,
	},
	errorChip: {
		backgroundColor: 'rgba(239, 68, 68, 0.15)',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
	},
	errorChipText: {
		color: '#fca5a5',
		fontSize: 12,
		fontWeight: '500',
	},
})
