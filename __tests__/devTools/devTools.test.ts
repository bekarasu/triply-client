import { consoleLogStore } from '@/devTools/consoleLogStore'
import { formatArgs, installConsoleLogger } from '@/devTools/installConsoleLogger'
import { installNetworkLogger } from '@/devTools/installNetworkLogger'
import { networkLogStore } from '@/devTools/networkLogStore'

afterEach(() => jest.useRealTimers())

describe('formatArgs', () => {
	it('applies printf placeholders like React warnings use', () => {
		expect(formatArgs(['Warning: %s is %d%% done%c', 'Upload', '42.9', 'color: red', 'extra'])).toBe(
			'Warning: Upload is 42% done extra',
		)
	})

	it('survives circular refs and marks only real cycles', () => {
		const shared = { a: 1 }
		const obj: Record<string, unknown> = { big: 1n, fn: function named() {}, one: shared, two: shared }
		obj.self = obj
		const text = formatArgs([obj])
		expect(text).toContain('"self": "[Circular]"')
		expect(text).toContain('"big": "1"')
		expect(text).toContain('"fn": "[Function named]"')
		expect(text).not.toContain('"two": "[Circular]"')
	})

	it('prints errors with their message and truncates long messages', () => {
		expect(formatArgs([new Error('boom')])).toContain('boom')
		expect(formatArgs(['x'.repeat(10_005)])).toMatch(/… \[5 more characters\]$/)
	})
})

it('records each console call once, after the current task, even when installed twice', () => {
	jest.useFakeTimers()
	console.log = jest.fn()
	installConsoleLogger()
	installConsoleLogger() // Fast Refresh
	console.log('hello %s', 'world')
	expect(consoleLogStore.get()).toHaveLength(0)
	jest.runAllTimers()
	expect(consoleLogStore.get().map((entry) => [entry.level, entry.message])).toEqual([['log', 'hello world']])
})

it('records requests without consuming the body, and failures', async () => {
	const fake = jest
		.fn()
		.mockResolvedValueOnce(
			new Response('{"ok":true}', { status: 201, headers: { 'content-type': 'application/json' } }),
		)
		.mockRejectedValueOnce(new Error('offline'))
	globalThis.fetch = fake
	installNetworkLogger()
	installNetworkLogger() // Fast Refresh

	const response = await fetch('https://api.test/trips', { method: 'post', body: 'a=1' })
	expect(await response.json()).toEqual({ ok: true })
	await expect(fetch('https://api.test/down')).rejects.toThrow('offline')
	await new Promise((resolve) => setTimeout(resolve, 0))

	const [failed, done] = networkLogStore.get().entries
	expect(networkLogStore.get().entries).toHaveLength(2)
	expect(done).toMatchObject({ method: 'POST', state: 'done', status: 201, requestBody: 'a=1', responseBody: '{"ok":true}' })
	expect(failed).toMatchObject({ state: 'failed', error: 'offline' })
})
