import { Recommendation, RecommendationCriteria } from '../recommendation/types'

export interface Trip {
	id: number
	cityId: number
	cityName: string
	recommendations: Recommendation[]
	additionalCityIds: number[]
	createdAt: string
	updatedAt: string
}

export interface CreateTripRequest {
	cityId: number
	recommendations: Recommendation[]
	additionalCityIds?: number[]
}

export interface GetRecommendationCriteriaResponse {
	criteria: RecommendationCriteria[]
	total: number
}
