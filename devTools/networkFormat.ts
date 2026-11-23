import Colors from '@/constants/Colors'
import type { NetworkEntry } from './networkLogStore'

export const isFailure = (entry: NetworkEntry) =>
	entry.state === 'failed' || (entry.status ?? 0) >= 400

export const statusLabel = (entry: NetworkEntry) =>
	entry.state === 'pending' ? '…' : entry.state === 'failed' ? 'ERR' : String(entry.status)

export const statusColor = (entry: NetworkEntry) =>
	entry.state === 'pending'
		? Colors.light.icon
		: isFailure(entry)
			? Colors.light.error
			: Colors.light.primary

export function splitUrl(url: string) {
	const match = /^https?:\/\/([^/?#]*)(.*)$/i.exec(url)
	return { host: match?.[1] ?? '', path: match?.[2] || '/' }
}

export const formatDuration = (ms?: number) =>
	ms === undefined ? '' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`

const pad = (value: number) => String(value).padStart(2, '0')

export function formatClock(time: number) {
	const date = new Date(time)
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatBody(body: string) {
	try {
		return JSON.stringify(JSON.parse(body), null, 2)
	} catch {
		return body
	}
}

/** "200 · 14:03:12 · 85 ms" */
export const statusLine = (entry: NetworkEntry) =>
	[statusLabel(entry), formatClock(entry.startedAt), formatDuration(entry.durationMs)]
		.filter(Boolean)
		.join(' · ')

const headerLines = (headers?: Record<string, string>) =>
	Object.entries(headers ?? {})
		.map(([key, value]) => `${key}: ${value}`)
		.join('\n') || '(none)'

export function entryToText(entry: NetworkEntry) {
	return [
		`${entry.method} ${entry.url}`,
		statusLine(entry),
		entry.error ? `Error: ${entry.error}` : null,
		'',
		'--- Request headers ---',
		headerLines(entry.requestHeaders),
		'',
		'--- Request body ---',
		entry.requestBody ? formatBody(entry.requestBody) : '(none)',
		'',
		'--- Response headers ---',
		headerLines(entry.responseHeaders),
		'',
		'--- Response body ---',
		entry.responseBody ? formatBody(entry.responseBody) : '(none)',
	]
		.filter((line) => line !== null)
		.join('\n')
}
