import { isProduction } from '@/utils/env-config'

export class Logger {
	static log(message: string, ...optionalParams: any[]) {
		console.log(message, ...optionalParams)
	}
	static error(message: string, ...optionalParams: any[]) {
		if (isProduction()) {
			console.log('Error occurred. Check logs for details.')
			// TODO send error request to log it
			return // Suppress error logs in production
		}
		console.error(message, ...optionalParams)
	}
}
