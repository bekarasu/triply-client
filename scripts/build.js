#!/usr/bin/env node

/**
 * Dynamic build script that accepts CLI arguments for environment and platform
 *
 * Usage:
 *   npm run build -- --env development --platform android
 *   npm run build -- --env staging --platform ios
 *   npm run build -- --env production --platform android --profile production
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name, defaultValue) => {
	const index = args.indexOf(`--${name}`)
	return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue
}

const env = getArg('env', 'development') // development, staging, production
const platform = getArg('platform', 'android') // android, ios, all
const profile = getArg(
	'profile',
	env === 'production'
		? 'production'
		: env === 'staging'
		? 'staging'
		: 'development',
)
const local = args.includes('--local')

// Validate environment file exists
const envFile = path.join(__dirname, '..', `.env.${env}`)
if (!fs.existsSync(envFile)) {
	console.error(`❌ Error: Environment file .env.${env} not found!`)
	console.error(
		`Available files: .env.development, .env.staging, .env.production`,
	)
	process.exit(1)
}

console.log(`\n🚀 Building ${platform} app with ${env} environment...`)
console.log(`📋 Profile: ${profile}`)
console.log(`📄 Env file: .env.${env}`)
console.log(`${local ? '💻 Local build' : '☁️  Cloud build'}\n`)

// Construct the build command
const localFlag = local ? '--local' : ''
const buildCommand = `NODE_ENV=${env} npx dotenv-cli -e .env.${env} -- eas build --profile ${profile} --platform ${platform} ${localFlag}`

try {
	// Execute the build command
	execSync(buildCommand, {
		stdio: 'inherit',
		cwd: path.join(__dirname, '..'),
	})

	console.log(`\n✅ Build completed successfully!`)
} catch (error) {
	console.error(`\n❌ Build failed!`)
	process.exit(1)
}
