export interface City {
	id: number
	name: string
	countryId: number
	population: number
	country: Country
	imageUrl?: string | null
}

export interface Country {
	id: number
	name: string
	iso2: string
}

export interface SearchCitiesResponse {
	cities: City[]
	total: number
	hasMore: boolean
}
