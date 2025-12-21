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

export interface Weather {
	date: string
	temperature: {
		minC: number
		maxC: number
	}
	dayPhrase: string
	precipitationProbability: number
}

export interface DayItinerary {
	day: number
	description: string
	places: Place[]
	foodPlaces: FoodPlace[]
	date: string
	weather?: Weather
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

// Trip Overview Types
export interface TripOverview {
	id: string
	firstDestination: string
	startDate: string
	endDate: string
	totalBudget: number
	totalDuration: number
	totalDestinations: number
	lastDestination: string
}

export interface TripOverviewResponse {
	code: number
	message: string
	data: TripOverview[]
}

export interface MyTripCity {
	cityId: string
	cityName: string
	days: DayItinerary[]
}

export interface MyTrip {
	id: string
	startDate: string
	endDate: string
	totalBudget: number
	totalDuration: number
	cities: MyTripCity[]
}

export interface MyTripsResponse {
	code: number
	message: string
	data: MyTrip[]
}
