export interface RouteCoordinate {
	latitude: number
	longitude: number
}

const readPolylineValue = (
	encoded: string,
	start: number,
): [value: number, nextIndex: number] => {
	let result = 0
	let shift = 0
	let index = start
	let byte: number

	do {
		byte = encoded.charCodeAt(index++) - 63
		result |= (byte & 0x1f) << shift
		shift += 5
	} while (byte >= 0x20 && index < encoded.length)

	return [result & 1 ? ~(result >> 1) : result >> 1, index]
}

// Decodes an encoded polyline (Google polyline algorithm, as returned by OSRM)
export const decodePolyline = (
	encoded: string,
	precision = 5,
): RouteCoordinate[] => {
	const factor = 10 ** precision
	const coordinates: RouteCoordinate[] = []
	let index = 0
	let latitude = 0
	let longitude = 0

	while (index < encoded.length) {
		const [latitudeChange, afterLatitude] = readPolylineValue(encoded, index)
		if (afterLatitude >= encoded.length) break

		const [longitudeChange, afterLongitude] = readPolylineValue(
			encoded,
			afterLatitude,
		)
		index = afterLongitude
		latitude += latitudeChange
		longitude += longitudeChange

		coordinates.push({
			latitude: latitude / factor,
			longitude: longitude / factor,
		})
	}

	return coordinates
}

export const formatRouteDistance = (meters: number) => {
	if (meters < 1000) return `${Math.round(meters)} m`
	return `${(meters / 1000).toFixed(1)} km`
}

export const formatRouteDuration = (seconds: number) => {
	const totalMinutes = Math.max(1, Math.round(seconds / 60))
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60

	if (hours === 0) return `${minutes} min`
	return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}
