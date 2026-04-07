module.exports = {
	testEnvironment: 'node',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'babel-jest',
			{
				presets: ['babel-preset-expo'],
			},
		],
	},
	transformIgnorePatterns: [
		'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
	],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	collectCoverageFrom: [
		'utils/**/*.{ts,tsx}',
		'services/**/*.{ts,tsx}',
		'contexts/**/*.{ts,tsx}',
		'hooks/**/*.{ts,tsx}',
		'!**/*.d.ts',
		'!**/types.ts',
		'!**/node_modules/**',
	],
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/components/',
		'types.ts',
		'hooks/useColorScheme.ts',
	],
	coverageThreshold: {
		global: {
			branches: 90,
			functions: 90,
			lines: 90,
			statements: 90,
		},
	},
	coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	clearMocks: true,
	testTimeout: 10000,
}
