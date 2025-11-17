export interface CreateTripCity {
	cityId: number
	budget: number
	duration: number
	criteriaIds: number[]
}

export interface CreateTripRequest {
	startDate: Date
	destinations: CreateTripCity[]
}

export interface CreateTripResponse {
	tripId: string
}
