import { consoleLogStore, type LogEntry, type LogLevel } from './consoleLogStore'

type ConsoleMethod = (...args: unknown[]) => void

const LEVELS: LogLevel[] = ['debug', 'log', 'info', 'warn', 'error']
const ORIGINAL = Symbol.for('devTools.originalConsole')
const MAX_MESSAGE = 10_000

export function installConsoleLogger() {
	const holder = globalThis as { [ORIGINAL]?: Record<LogLevel, ConsoleMethod> }
	// Fast Refresh re-runs this module: always wrap the untouched originals, never our previous wrapper.
	const original = (holder[ORIGINAL] ??= Object.fromEntries(
		LEVELS.map((level) => [level, console[level]]),
	) as Record<LogLevel, ConsoleMethod>)

	let queue: Omit<LogEntry, 'id'>[] = []
	let formatting = false
	const flush = () => {
		const items = queue
		queue = []
		consoleLogStore.addMany(items)
	}

	for (const level of LEVELS) {
		console[level] = (...args: unknown[]) => {
			original[level].apply(console, args)
			if (formatting) return // logged from inside formatting (e.g. a toJSON): pass through only
			formatting = true
			try {
				const message = formatArgs(args)
				// React warns mid-render; updating the store now would re-render and loop, so batch after this task.
				if (queue.push({ level, at: Date.now(), message }) === 1) {
					setTimeout(flush, 0)
				}
			} catch {
				// never break the code that is logging
			} finally {
				formatting = false
			}
		}
	}
}

export function formatArgs(args: unknown[]): string {
	let head: string[] = []
	let rest = args
	const [first] = args
	if (typeof first === 'string' && first.includes('%')) {
		let next = 1
		head = [
			first.replace(/%([sdifoOc%])/g, (match, type: string) => {
				if (type === '%') return '%'
				if (next >= args.length) return match
				const value = args[next++]
				if (type === 'c') return ''
				if (type === 'd' || type === 'i') return String(parseInt(String(value), 10))
				if (type === 'f') return String(Number(value))
				return stringify(value)
			}),
		]
		rest = args.slice(next)
	}

	const message = [...head, ...rest.map(stringify)].join(' ')
	return message.length > MAX_MESSAGE
		? `${message.slice(0, MAX_MESSAGE)}… [${message.length - MAX_MESSAGE} more characters]`
		: message
}

function stringify(value: unknown): string {
	if (typeof value === 'string') return value
	if (value instanceof Error) return errorText(value)
	if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`
	if (typeof value !== 'object' || value === null) return String(value)

	const ancestors: unknown[] = []
	const json = JSON.stringify(
		value,
		function (this: unknown, _key, child: unknown) {
			// `this` is the holder of `child`; trimming the stack back to it leaves only real ancestors
			const at = ancestors.indexOf(this)
			if (at === -1) ancestors.push(this)
			else ancestors.length = at + 1

			if (typeof child === 'object' && child !== null && ancestors.includes(child)) return '[Circular]'
			if (child instanceof Error) return errorText(child)
			if (typeof child === 'function') return `[Function ${child.name || 'anonymous'}]`
			if (typeof child === 'bigint') return child.toString()
			return child
		},
		2,
	)
	return json ?? String(value)
}

function errorText(error: Error): string {
	const stack = error.stack ?? ''
	if (stack && stack.includes(error.message)) return stack
	return [`${error.name}: ${error.message}`, stack].filter(Boolean).join('\n')
}
