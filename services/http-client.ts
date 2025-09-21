// HTTP Client with error handling
import { API_CONFIG } from './api-config'

export interface ApiResponse<T = any> {
	success: boolean
	message: string
	data: T
}

export interface ApiError {
	message: string
	status?: number
	details?: any
}

class HttpClient {
	private timeout: number

	constructor() {
		this.timeout = API_CONFIG.TIMEOUT
	}

	private async request<T>(
		url: string,
		options: RequestInit = {},
	): Promise<ApiResponse<T>> {
		const config: RequestInit = {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
		}

		// Add timeout
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), this.timeout)
		config.signal = controller.signal

		try {
			const response = await fetch(url, config)
			clearTimeout(timeoutId)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw {
					message:
						errorData.message || `HTTP Error: ${response.status}`,
					status: response.status,
					details: errorData,
				} as ApiError
			}

			const data = await response.json()
			return data
		} catch (error: any) {
			clearTimeout(timeoutId)

			if (error.name === 'AbortError') {
				throw {
					message: 'Request timeout',
					status: 408,
				} as ApiError
			}

			if (error.message && error.status) {
				throw error as ApiError
			}

			throw {
				message: error.message || 'Network error occurred',
				status: 0,
				details: error,
			} as ApiError
		}
	}

	async get<T>(
		endpoint: string,
		headers?: Record<string, string>,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'GET',
			headers,
		})
	}

	async post<T>(
		endpoint: string,
		body?: any,
		headers?: Record<string, string>,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined,
			headers,
		})
	}

	async put<T>(
		endpoint: string,
		body?: any,
		headers?: Record<string, string>,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: body ? JSON.stringify(body) : undefined,
			headers,
		})
	}

	async delete<T>(
		endpoint: string,
		headers?: Record<string, string>,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'DELETE',
			headers,
		})
	}
}

export const httpClient = new HttpClient()
