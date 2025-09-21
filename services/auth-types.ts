// Authentication Types
export interface LoginCredentials {
	email: string
	password: string
}

export interface RegisterData {
	email: string
	password: string
	confirmPassword: string
	firstName: string
	lastName: string
}

export interface LoginRequest {
	credentials: LoginCredentials
}

export interface PreRegisterRequest {
	email: string
	password: string
	confirmPassword: string
	firstName: string
	lastName: string
}

export interface VerifyOtpRequest {
	otpCode: string
	otpToken: string
}

export interface ResendOtpRequest {
	email: string
}

export interface Token {
	accessToken: string
	refreshToken: string
	expiresIn: number
}

export interface LoginResponse {
	token: Token
}

export interface PreRegisterResponse {
	otpToken: string
}

export interface ResendOtpResponse {
	message: string
	email: string
}

export interface User {
	id: string
	email: string
	firstName: string
	lastName: string
}

export interface AuthState {
	isAuthenticated: boolean
	user: User | null
	token: Token | null
	loading: boolean
}
