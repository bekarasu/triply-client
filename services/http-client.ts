// HTTP Client with error handling
import { API_CONFIG } from './api-config'
import { tokenManager } from './auth/token-manager'
import { networkMonitor } from './network-monitor'
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
	monitorId: string | null
}

class HttpClient {
	private timeout: number
	private isRefreshing: boolean = false
	private requestQueue: QueuedRequest[] = []

	constructor() {
		this.timeout = API_CONFIG.TIMEOUT
	}

	private normalizeHeaders(
		headers?: HeadersInit | Headers | Record<string, string>,
	): Record<string, string> | undefined {
		if (!headers) {
			return undefined
		}

		if (headers instanceof Headers) {
			const result: Record<string, string> = {}
			headers.forEach((value, key) => {
				result[key] = value
			})
			return result
		}

		if (Array.isArray(headers)) {
			return headers.reduce((acc, [key, value]) => {
				acc[key.toLowerCase()] = value
				return acc
			}, {} as Record<string, string>)
		}

		return Object.entries(headers as Record<string, string>).reduce(
			(acc, [key, value]) => {
				acc[key.toLowerCase()] = String(value)
				return acc
			},
			{} as Record<string, string>,
		)
	}

	private parseRequestBody(body?: BodyInit | null): any {
		if (!body) {
			return undefined
		}

		if (typeof body === 'string') {
			try {
				return JSON.parse(body)
			} catch (error) {
				return body
			}
		}

		if (body instanceof FormData) {
			const result: Record<string, any> = {}
			body.forEach((value, key) => {
				result[key] = value
			})
			return result
		}

		return '[unserializable payload]'
	}

	private startMonitorEntry(url: string, config: RequestInit): string | null {
		return networkMonitor.start({
			method: (config.method || 'GET').toString().toUpperCase(),
			url,
			startedAt: Date.now(),
			requestHeaders: this.normalizeHeaders(config.headers),
			requestBody: this.parseRequestBody(config.body as BodyInit | null),
		})
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
				const responseHeaders = this.normalizeHeaders(response.headers)
				if (response.ok) {
					const data = await response.json()
					networkMonitor.success(queuedRequest.monitorId, {
						statusCode: response.status,
						responseHeaders,
						responseBody: data,
					})
					queuedRequest.resolve(data)
				} else {
					const errorData = await response.json().catch(() => ({}))
					networkMonitor.error(queuedRequest.monitorId, {
						statusCode: response.status,
						responseHeaders,
						responseBody: errorData,
						errorMessage:
							errorData.error?.message ||
							`HTTP Error: ${response.status}`,
					})
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
				networkMonitor.error(queuedRequest.monitorId, {
					errorMessage:
						error instanceof Error
							? error.message
							: 'Network error occurred',
				})
				queuedRequest.reject(error)
			}
		}
	}

	private rejectQueuedRequests(error: ApiError): void {
		const requests = [...this.requestQueue]
		this.requestQueue = []

		for (const queuedRequest of requests) {
			networkMonitor.error(queuedRequest.monitorId, {
				statusCode: error.status,
				responseBody: error.details,
				errorMessage: error.message,
			})
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

		const monitorId = this.startMonitorEntry(url, config)
		let monitorFinalized = false

		const finalizeSuccess = (
			statusCode: number,
			headers?: Record<string, string>,
			body?: any,
		) => {
			if (monitorFinalized) {
				return
			}
			monitorFinalized = true
			networkMonitor.success(monitorId, {
				statusCode,
				responseHeaders: headers,
				responseBody: body,
			})
		}

		const finalizeError = (
			statusCode?: number,
			headers?: Record<string, string>,
			body?: any,
			message?: string,
		) => {
			if (monitorFinalized) {
				return
			}
			monitorFinalized = true
			networkMonitor.error(monitorId, {
				statusCode,
				responseHeaders: headers,
				responseBody: body,
				errorMessage: message,
			})
		}

		try {
			const response = await fetch(url, config)
			clearTimeout(timeoutId)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				const responseHeaders = this.normalizeHeaders(response.headers)

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
									monitorId,
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

							finalizeError(
								response.status,
								responseHeaders,
								errorData,
								errorData.error?.message ||
									`HTTP Error: ${response.status}`,
							)

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
							const retryHeaders = this.normalizeHeaders(
								retryResponse.headers,
							)

							if (retryResponse.ok) {
								const retryData = await retryResponse.json()
								finalizeSuccess(
									retryResponse.status,
									retryHeaders,
									retryData,
								)
								return retryData
							}

							const retryErrorData = await retryResponse
								.json()
								.catch(() => ({}))
							finalizeError(
								retryResponse.status,
								retryHeaders,
								retryErrorData,
								retryErrorData.error?.message ||
									`HTTP Error: ${retryResponse.status}`,
							)

							throw {
								message:
									retryErrorData.error?.message ||
									`HTTP Error: ${retryResponse.status}`,
								code:
									retryErrorData.error?.code || 'HTTP_ERROR',
								status: retryResponse.status,
								details: retryErrorData,
							} as ApiError
						}
					} finally {
						this.isRefreshing = false
					}
				}

				finalizeError(
					response.status,
					responseHeaders,
					errorData,
					errorData.error?.message ||
						`HTTP Error: ${response.status}`,
				)

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
			const responseHeaders = this.normalizeHeaders(response.headers)
			finalizeSuccess(response.status, responseHeaders, data)
			return data
		} catch (error: any) {
			clearTimeout(timeoutId)

			if (error.name === 'AbortError') {
				finalizeError(
					undefined,
					undefined,
					undefined,
					'Request aborted',
				)
				throw error
			}

			if (error.message && error.status) {
				finalizeError(
					error.status,
					undefined,
					error.details,
					error.message,
				)
				throw error as ApiError
			}

			finalizeError(0, undefined, error, error.message)
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
