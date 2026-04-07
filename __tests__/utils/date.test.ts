import { formatDateOnly } from '@/utils/date'

describe('formatDateOnly', () => {
	it('formats a Date object to YYYY-MM-DD string', () => {
		const date = new Date('2024-03-15T10:30:00Z')
		const result = formatDateOnly(date)
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})

	it('formats a date string to YYYY-MM-DD string', () => {
		const dateString = '2024-12-25'
		const result = formatDateOnly(dateString)
		expect(result).toBe('2024-12-25')
	})

	it('pads single-digit months with leading zero', () => {
		const date = new Date('2024-01-05')
		const result = formatDateOnly(date)
		expect(result).toMatch(/-01-/)
	})

	it('pads single-digit days with leading zero', () => {
		const date = new Date('2024-03-05')
		const result = formatDateOnly(date)
		expect(result).toMatch(/-05$/)
	})

	it('handles end of year dates', () => {
		const date = new Date('2024-12-31')
		const result = formatDateOnly(date)
		expect(result).toBe('2024-12-31')
	})

	it('handles beginning of year dates', () => {
		const date = new Date('2024-01-01')
		const result = formatDateOnly(date)
		expect(result).toBe('2024-01-01')
	})

	it('handles leap year dates', () => {
		const date = new Date('2024-02-29')
		const result = formatDateOnly(date)
		expect(result).toBe('2024-02-29')
	})

	it('handles ISO string input', () => {
		const isoString = '2024-06-15T14:30:00.000Z'
		const result = formatDateOnly(isoString)
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})
})
