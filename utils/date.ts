export const formatDateOnly = (dateInput: Date | string) => {
	const d = new Date(dateInput)
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
		2,
		'0',
	)}-${String(d.getDate()).padStart(2, '0')}`
}
