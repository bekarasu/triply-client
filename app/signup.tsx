import { authService } from '@/services/auth/service'
import { ApiError } from '@/services/http-client'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native'

export default function SignupScreen() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const validateForm = () => {
		if (
			!email ||
			!password ||
			!confirmPassword ||
			!firstName ||
			!lastName
		) {
			Alert.alert('Error', 'Please fill in all fields')
			return false
		}

		if (password !== confirmPassword) {
			Alert.alert('Error', 'Passwords do not match')
			return false
		}

		if (password.length < 8) {
			Alert.alert('Error', 'Password must be at least 8 characters long')
			return false
		}

		// Check password strength
		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
		if (!passwordRegex.test(password)) {
			Alert.alert(
				'Error',
				'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			)
			return false
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			Alert.alert('Error', 'Please enter a valid email address')
			return false
		}

		return true
	}

	const handleSignup = async () => {
		if (!validateForm()) return

		setLoading(true)
		try {
			const response = await authService.preRegister({
				email,
				password,
				confirmPassword,
				firstName,
				lastName,
			})

			// Navigate to OTP verification screen
			router.push({
				pathname: '/verify-otp' as any,
				params: {
					otpToken: response.otpToken,
					email: email,
				},
			})
		} catch (error: any) {
			const apiError = error as ApiError
			Alert.alert(
				'Registration Failed',
				apiError.message || 'An error occurred during registration',
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<ScrollView contentContainerStyle={styles.scrollContent}>
						<View style={styles.content}>
							<Text style={styles.title}>Join Triply</Text>
							<Text style={styles.subtitle}>
								Create your account to get started
							</Text>

							<View style={styles.nameContainer}>
								<View
									style={[
										styles.inputContainer,
										styles.nameInput,
									]}
								>
									<TextInput
										style={styles.input}
										placeholder="First Name"
										value={firstName}
										onChangeText={setFirstName}
										autoCapitalize="words"
										autoCorrect={false}
										autoComplete="given-name"
										textContentType="givenName"
										returnKeyType="next"
									/>
								</View>
								<View
									style={[
										styles.inputContainer,
										styles.nameInput,
									]}
								>
									<TextInput
										style={styles.input}
										placeholder="Last Name"
										value={lastName}
										onChangeText={setLastName}
										autoCapitalize="words"
										autoCorrect={false}
										autoComplete="family-name"
										textContentType="familyName"
										returnKeyType="next"
									/>
								</View>
							</View>

							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Email"
									value={email}
									onChangeText={setEmail}
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									autoComplete="email"
									textContentType="emailAddress"
									returnKeyType="next"
								/>
							</View>

							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Password"
									value={password}
									onChangeText={setPassword}
									secureTextEntry={true}
									autoCapitalize="none"
									autoComplete="password"
									textContentType="oneTimeCode"
									autoCorrect={false}
									returnKeyType="next"
									blurOnSubmit={false}
								/>
							</View>

							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Confirm Password"
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry={true}
									autoCapitalize="none"
									autoComplete="password"
									textContentType="oneTimeCode"
									autoCorrect={false}
									returnKeyType="done"
									onSubmitEditing={handleSignup}
								/>
							</View>

							<Text style={styles.passwordHint}>
								Password must contain at least 8 characters with
								uppercase, lowercase, number, and special
								character
							</Text>

							<TouchableOpacity
								style={[
									styles.signupButton,
									loading && styles.signupButtonDisabled,
								]}
								onPress={handleSignup}
								disabled={loading}
							>
								{loading ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.signupButtonText}>
										Create Account
									</Text>
								)}
							</TouchableOpacity>

							<View style={styles.loginContainer}>
								<Text style={styles.loginText}>
									Already have an account?{' '}
								</Text>
								<TouchableOpacity onPress={() => router.back()}>
									<Text style={styles.loginLink}>
										Sign In
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center',
		paddingTop: 40,
	},
	title: {
		fontSize: 36,
		fontWeight: '800',
		textAlign: 'center',
		marginBottom: 12,
		color: '#1f2937',
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: 18,
		textAlign: 'center',
		marginBottom: 48,
		color: '#6b7280',
		lineHeight: 26,
		paddingHorizontal: 16,
	},
	nameContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	nameInput: {
		flex: 1,
	},
	inputContainer: {
		marginBottom: 20,
		marginHorizontal: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: '#f1f5f9',
		borderRadius: 16,
		paddingHorizontal: 20,
		paddingVertical: 18,
		fontSize: 16,
		backgroundColor: '#fff',
		color: '#1f2937',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	passwordHint: {
		fontSize: 13,
		color: '#6b7280',
		marginBottom: 24,
		lineHeight: 18,
		textAlign: 'center',
		paddingHorizontal: 16,
	},
	signupButton: {
		backgroundColor: '#6366f1',
		borderRadius: 16,
		paddingVertical: 18,
		marginTop: 12,
		marginBottom: 24,
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	signupButtonDisabled: {
		backgroundColor: '#d1d5db',
		shadowOpacity: 0.1,
	},
	signupButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
		textAlign: 'center',
	},
	loginContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
	},
	loginText: {
		color: '#6b7280',
		fontSize: 16,
	},
	loginLink: {
		color: '#6366f1',
		fontSize: 16,
		fontWeight: '700',
	},
})
