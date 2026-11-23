import { useSyncExternalStore } from 'react'
import { createStore } from './createStore'

export type LogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error'

export interface LogEntry {
	id: number
	level: LogLevel
	at: number
	message: string
}

const MAX_ENTRIES = 500

// Memory only: logs can contain personal data, so they never touch disk.
const store = createStore<LogEntry[]>([])
let nextId = 1

export const consoleLogStore = {
	get: store.get,
	subscribe: store.subscribe,
	addMany(items: Omit<LogEntry, 'id'>[]) {
		const added = items.map((item) => ({ ...item, id: nextId++ })).reverse()
		store.set([...added, ...store.get()].slice(0, MAX_ENTRIES))
	},
	clear: () => store.set([]),
}

export const useConsoleLogs = () =>
	useSyncExternalStore(store.subscribe, store.get)
