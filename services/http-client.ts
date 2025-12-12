// HTTP Client with error handling
import { API_CONFIG } from './api-config'
import { tokenManager } from './auth/token-manager'
export interface ApiResponse<T = any> {
	success: boolean
	message: string
	data: T
}

export interface ApiError {
	status: number
	code: string
	message: string
	details?: any
}

interface QueuedRequest {
	resolve: (value: any) => void
	reject: (error: any) => void
	url: string
	config: RequestInit
}

class HttpClient {
	private timeout: number
	private isRefreshing: boolean = false
	private requestQueue: QueuedRequest[] = []

	constructor() {
		this.timeout = API_CONFIG.TIMEOUT
	}

	private async processQueuedRequests(): Promise<void> {
		const authHeader = await tokenManager.getAuthHeader()

		// Process all queued requests
		const requests = [...this.requestQueue]
		this.requestQueue = []

		for (const queuedRequest of requests) {
			try {
				const retryConfig = {
					...queuedRequest.config,
					headers: {
						...queuedRequest.config.headers,
						...authHeader,
					},
				}

				const response = await fetch(queuedRequest.url, retryConfig)
				if (response.ok) {
					const data = await response.json()
					queuedRequest.resolve(data)
				} else {
					const errorData = await response.json().catch(() => ({}))
					queuedRequest.reject({
						message:
							errorData.error?.message ||
							`HTTP Error: ${response.status}`,
						code: errorData.error?.code || 'HTTP_ERROR',
						status: response.status,
						details: errorData,
					} as ApiError)
				}
			} catch (error) {
				queuedRequest.reject(error)
			}
		}
	}

	private rejectQueuedRequests(error: ApiError): void {
		const requests = [...this.requestQueue]
		this.requestQueue = []

		for (const queuedRequest of requests) {
			queuedRequest.reject(error)
		}
	}

	private async request<T>(
		url: string,
		options: RequestInit = {},
		timeout: number = this.timeout,
	): Promise<ApiResponse<T>> {
		// Get auth header if available
		const authHeader = await tokenManager.getAuthHeader()

		const config: RequestInit = {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...authHeader,
				...options.headers,
			},
		}

		// Add timeout (but respect existing signal if provided)
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), timeout)

		// If a signal is already provided, listen to it
		if (options.signal) {
			options.signal.addEventListener('abort', () => controller.abort())
		}

		config.signal = controller.signal

		try {
			const response = await fetch(url, config)
			clearTimeout(timeoutId)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))

				if (response.status === 401) {
					if (this.isRefreshing) {
						// If token refresh is in progress, queue this request
						return new Promise<ApiResponse<T>>(
							(resolve, reject) => {
								this.requestQueue.push({
									resolve,
									reject,
									url,
									config,
								})
							},
						)
					}

					this.isRefreshing = true

					try {
						const refreshSuccessful =
							await tokenManager.handle401Unauthorized()

						if (!refreshSuccessful) {
							// Reject all queued requests if refresh failed
							this.rejectQueuedRequests({
								message:
									errorData.error?.message ||
									`HTTP Error: ${response.status}`,
								code: errorData.error?.code || 'HTTP_ERROR',
								status: response.status,
								details: errorData,
							} as ApiError)

							throw {
								message:
									errorData.error?.message ||
									`HTTP Error: ${response.status}`,
								code: errorData.error?.code || 'HTTP_ERROR',
								status: response.status,
								details: errorData,
							} as ApiError
						}

						// Process queued requests after successful token refresh
						this.processQueuedRequests()

						// Retry the original request
						const authHeader = await tokenManager.getAuthHeader()
						if (authHeader) {
							const retryConfig = {
								...config,
								headers: {
									...config.headers,
									...authHeader,
								},
							}

							const retryResponse = await fetch(url, retryConfig)
							if (retryResponse.ok) {
								const retryData = await retryResponse.json()
								return retryData
							}
						}
					} finally {
						this.isRefreshing = false
					}
				}

				throw {
					message:
						errorData.error?.message ||
						`HTTP Error: ${response.status}`,
					code: errorData.error?.code || 'HTTP_ERROR',
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
		timeout: number = this.timeout,
		signal?: AbortSignal,
	): Promise<ApiResponse<T>> {
		return this.request<T>(
			endpoint,
			{
				method: 'POST',
				body: body ? JSON.stringify(body) : undefined,
				headers,
				signal,
			},
			timeout,
		)
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
