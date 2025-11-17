import { Alert } from 'react-native'
import { API_CONFIG } from '../api-config'
import { authService } from '../auth/service'
import { ApiResponse, httpClient } from '../http-client'
import { LoggerService } from '../logger'
import { RecommendationCriteria } from './types'

const ENDPOINTS = {
	RECOMMENDATION_CRITERIA: `${API_CONFIG.SERVICE_BASE_URL.RECOMMENDATION}/criterias`,
}

class RecommendationService {
	async getRecommendationCriterias(): Promise<
		RecommendationCriteria[] | null
	> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			const response: ApiResponse<RecommendationCriteria[]> =
				await httpClient.get(
					ENDPOINTS.RECOMMENDATION_CRITERIA,
					authHeader,
				)

			LoggerService.log(
				'Recommendation criteria response:',
				response.data,
			)
			return response.data
		} catch (error) {
			Logger.error('Recommendation criteria error:', error)
		}
	}
}

export const recommendationService = new RecommendationService()
