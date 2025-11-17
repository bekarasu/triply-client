import { Alert } from 'react-native'
import { API_CONFIG } from '../api-config'
import { authService } from '../auth/service'
import { ApiResponse, httpClient } from '../http-client'
import { Logger } from '../logger'
import { Criteria } from './types'

const ENDPOINTS = {
	RECOMMENDATION_CRITERIA: `${API_CONFIG.SERVICE_BASE_URL.RECOMMENDATION}/criterias`,
}

class RecommendationService {
	async getRecommendationCriterias(): Promise<Criteria[]> {
		try {
			const authHeader = await authService.getAuthHeader()
			if (!authHeader) throw new Error('No auth token found')

			const response: ApiResponse<Criteria[]> = await httpClient.get(
				ENDPOINTS.RECOMMENDATION_CRITERIA,
				authHeader,
			)
			return response.data || []
		} catch (error) {
			Logger.error('Recommendation criteria error:', error)
			Alert.alert('Error', 'Failed to fetch recommendation criterias.')
			return []
		}
	}
}

export const recommendationService = new RecommendationService()
