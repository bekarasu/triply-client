import { networkLogStore } from './networkLogStore'

const ORIGINAL = Symbol.for('devTools.originalFetch')
const READABLE_TYPE = /json|text|xml|javascript|x-www-form-urlencoded/i
const MAX_BODY = 100_000

type Fetch = typeof fetch & { [ORIGINAL]?: typeof fetch }

export function installNetworkLogger() {
	const current = globalThis.fetch as Fetch
	// Fast Refresh re-runs this module: wrap the real fetch, not our previous wrapper.
	const original = current[ORIGINAL] ?? current

	const wrapped: Fetch = async (input, init) => {
		const request = typeof input === 'object' && 'url' in input ? input : undefined
		const url = typeof input === 'string' ? input : 'url' in input ? input.url : input.href
		if (!/^https?:/i.test(url)) return original(input, init)

		const startedAt = Date.now()
		const id = networkLogStore.add({
			method: (init?.method ?? request?.method ?? 'GET').toUpperCase(),
			url,
			startedAt,
			state: 'pending',
			requestHeaders: headersToObject(new Headers(init?.headers ?? request?.headers)),
			// shortcut: the body of a Request object passed as input isn't shown, only init.body; read a clone if that's ever needed
			requestBody: describeBody(init?.body),
		})

		let response: Response
		try {
			response = await original(input, init)
		} catch (error) {
			networkLogStore.update(id, {
				state: 'failed',
				durationMs: Date.now() - startedAt,
				error: error instanceof Error ? error.message : String(error),
			})
			throw error
		}

		logResponse(id, response, Date.now() - startedAt)
		return response
	}

	wrapped[ORIGINAL] = original
	globalThis.fetch = wrapped
}

function logResponse(id: number, response: Response, durationMs: number) {
	const done = { state: 'done', status: response.status, durationMs } as const
	try {
		const type = response.headers.get('content-type') ?? ''
		// Clone before the caller gets the response, so it can still consume the body.
		const copy = READABLE_TYPE.test(type) ? response.clone() : undefined
		networkLogStore.update(id, {
			...done,
			responseHeaders: headersToObject(response.headers),
			responseBody: copy
				? undefined
				: `[${type || 'unknown type'}, ${response.headers.get('content-length') ?? '?'} bytes, not shown]`,
		})
		copy?.text().then(
			(text) =>
				networkLogStore.update(id, {
					responseBody:
						text.length > MAX_BODY
							? `${text.slice(0, MAX_BODY)}… [${text.length - MAX_BODY} more characters]`
							: text,
				}),
			(error) => networkLogStore.update(id, { responseBody: `[Could not read body: ${String(error)}]` }),
		)
	} catch {
		// logging must never fail a request that succeeded
		networkLogStore.update(id, done)
	}
}

function headersToObject(headers: Headers) {
	const result: Record<string, string> = {}
	headers.forEach((value, key) => {
		result[key] = value
	})
	return result
}

function describeBody(body: unknown): string | undefined {
	if (body == null) return undefined
	if (typeof body === 'string') return body
	if (body instanceof URLSearchParams) return body.toString()
	if (body instanceof FormData) {
		const lines: string[] = []
		body.forEach((value, name) => {
			lines.push(`${name}: ${typeof value === 'string' ? value : fileSummary(value)}`)
		})
		return lines.join('\n')
	}
	if (body instanceof Blob) return fileSummary(body)
	if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return `[Binary, ${body.byteLength} bytes]`
	return String(body)
}

// RN file parts are { uri, name, type } objects without a size, hence the '?'.
const fileSummary = (file: { name?: string; type?: string; size?: number }) =>
	`[File ${file.name ?? 'blob'}, ${file.type || 'unknown type'}, ${file.size ?? '?'} bytes]`
