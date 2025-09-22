import { isProduction } from '@/utils/env-config'

export class LoggerService {
	static log(message: string, ...optionalParams: any[]) {
		console.log(message, ...optionalParams)
	}
	static error(message: string, ...optionalParams: any[]) {
		if (isProduction()) {
			return // Suppress error logs in production
		}
		console.error(message, ...optionalParams)
	}
}
