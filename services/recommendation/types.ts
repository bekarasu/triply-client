export interface Criteria {
	id: number
	name: string
	description: string
	icon: string
	category: string
}

export interface Trip {
	id: number
	cityId: number
	cityName: string
	criterias: Criteria[]
	additionalCityIds: number[]
	createdAt: string
	updatedAt: string
}
