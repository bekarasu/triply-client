import { useSyncExternalStore } from 'react'
import { createStore } from './createStore'

export interface NetworkEntry {
	id: number
	method: string
	url: string
	startedAt: number
	state: 'pending' | 'done' | 'failed'
	status?: number
	/** Until the response headers arrived. */
	durationMs?: number
	requestHeaders: Record<string, string>
	requestBody?: string
	responseHeaders?: Record<string, string>
	responseBody?: string
	error?: string
}

const MAX_ENTRIES = 200

const store = createStore<{ entries: NetworkEntry[]; selectedId: number | null }>({
	entries: [],
	selectedId: null,
})
let nextId = 1

export const networkLogStore = {
	get: store.get,
	subscribe: store.subscribe,
	add(entry: Omit<NetworkEntry, 'id'>) {
		const id = nextId++
		const state = store.get()
		store.set({ ...state, entries: [{ ...entry, id }, ...state.entries].slice(0, MAX_ENTRIES) })
		return id
	},
	update(id: number, patch: Partial<NetworkEntry>) {
		const state = store.get()
		store.set({
			...state,
			entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
		})
	},
	clear: () => store.set({ entries: [], selectedId: null }),
	// The open request lives here, not in component state, so the Android back handler can close it.
	select: (selectedId: number | null) => store.set({ ...store.get(), selectedId }),
}

export const useNetworkLog = () =>
	useSyncExternalStore(store.subscribe, store.get)
