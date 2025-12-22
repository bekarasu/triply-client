import { ENV_CONFIG } from '@/utils/env-config'

export type NetworkLogState = 'pending' | 'success' | 'error'

export interface NetworkLogEntry {
	id: string
	method: string
	url: string
	startedAt: number
	completedAt?: number
	statusCode?: number
	requestHeaders?: Record<string, string>
	requestBody?: any
	responseHeaders?: Record<string, string>
	responseBody?: any
	durationMs?: number
	state: NetworkLogState
	errorMessage?: string
}

interface NetworkLogStartPayload {
	method: string
	url: string
	startedAt: number
	requestHeaders?: Record<string, string>
	requestBody?: any
}

interface NetworkLogFinalizePayload {
	statusCode?: number
	responseHeaders?: Record<string, string>
	responseBody?: any
	durationMs?: number
	errorMessage?: string
}

type Subscriber = (entries: NetworkLogEntry[]) => void

class NetworkMonitor {
	private logs: NetworkLogEntry[] = []
	private subscribers = new Set<Subscriber>()
	private counter = 0
	private readonly maxEntries = 150
	readonly isEnabled = ENV_CONFIG.ENABLE_NETWORK_MONITOR

	start(payload: NetworkLogStartPayload): string | null {
		if (!this.isEnabled) {
			return null
		}

		const id = `${Date.now()}-${this.counter++}`
		const entry: NetworkLogEntry = {
			id,
			method: payload.method.toUpperCase(),
			url: payload.url,
			startedAt: payload.startedAt,
			requestHeaders: payload.requestHeaders,
			requestBody: payload.requestBody,
			state: 'pending',
		}

		this.logs = [entry, ...this.logs].slice(0, this.maxEntries)
		this.notify()
		return id
	}

	success(id: string | null, payload: NetworkLogFinalizePayload = {}) {
		if (!this.isEnabled || !id) {
			return
		}

		this.updateEntry(id, {
			state: 'success',
			statusCode: payload.statusCode,
			responseHeaders: payload.responseHeaders,
			responseBody: payload.responseBody,
			completedAt: Date.now(),
			durationMs: payload.durationMs,
		})
	}

	error(id: string | null, payload: NetworkLogFinalizePayload = {}) {
		if (!this.isEnabled || !id) {
			return
		}

		this.updateEntry(id, {
			state: 'error',
			statusCode: payload.statusCode,
			responseHeaders: payload.responseHeaders,
			responseBody: payload.responseBody,
			completedAt: Date.now(),
			durationMs: payload.durationMs,
			errorMessage: payload.errorMessage,
		})
	}

	subscribe(listener: Subscriber): () => void {
		if (!this.isEnabled) {
			listener([])
			return () => undefined
		}

		listener([...this.logs])
		this.subscribers.add(listener)
		return () => {
			this.subscribers.delete(listener)
		}
	}

	getLogs(): NetworkLogEntry[] {
		return this.isEnabled ? [...this.logs] : []
	}

	clear() {
		if (!this.isEnabled) {
			return
		}

		this.logs = []
		this.notify()
	}

	private updateEntry(id: string, patch: Partial<NetworkLogEntry>) {
		let updated = false

		this.logs = this.logs.map((entry) => {
			if (entry.id !== id) {
				return entry
			}

			updated = true
			const completedAt =
				patch.completedAt ?? entry.completedAt ?? Date.now()
			const duration =
				patch.durationMs !== undefined
					? patch.durationMs
					: completedAt - entry.startedAt

			return {
				...entry,
				...patch,
				completedAt,
				durationMs: duration,
			}
		})

		if (updated) {
			this.notify()
		}
	}

	private notify() {
		const snapshot = [...this.logs]
		this.subscribers.forEach((listener) => listener(snapshot))
	}
}

export const networkMonitor = new NetworkMonitor()
