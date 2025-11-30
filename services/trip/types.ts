export interface CreateTripCity {
	cityId: number
	budget: number
	duration: number
	criteriaIds: number[]
}

export interface CreateTripRequest {
	startDate: string
	destinations: CreateTripCity[]
}

export interface CreateTripResponse {
	code: number
	message: string
	data: TripDetails
}

// Trip Details Response Types
export interface Place {
	name: string
	description: string
}

export interface FoodPlace {
	name: string
	description: string
}

export interface DayItinerary {
	day: number
	description: string
	places: Place[]
	foodPlaces: FoodPlace[]
}

export interface CityItinerary {
	cityName: string
	days: DayItinerary[]
}

export interface TripDetails {
	id: string
	cities: CityItinerary[]
}

export interface TripDetailsResponse {
	data: TripDetails
}
