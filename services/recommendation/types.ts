export interface RecommendationCriteria {
	id: number
	name: string
	description: string
	icon: string
	category: string
}

export interface Recommendation {
	criteriaId: number
	priority: 'high' | 'medium' | 'low'
}

export interface Trip {
	id: number
	cityId: number
	cityName: string
	recommendations: Recommendation[]
	additionalCityIds: number[]
	createdAt: string
	updatedAt: string
}
