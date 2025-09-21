import React, { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	Alert,
	ActivityIndicator,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native'
import { useRouter } from 'expo-router'
import { authService } from '@/services/auth-service'
import { ApiError } from '@/services/http-client'

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

			console.log('Pre-registration successful:', response)

			// Navigate to OTP verification screen
			router.push({
				pathname: '/verify-otp' as any,
				params: {
					otpToken: response.otpToken,
					email: email,
				},
			})
		} catch (error: any) {
			console.error('Signup error:', error)
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
									textContentType="password"
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
									textContentType="password"
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
		backgroundColor: '#fff',
	},
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	content: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 8,
		color: '#333',
	},
	subtitle: {
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 40,
		color: '#666',
	},
	nameContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	nameInput: {
		flex: 1,
	},
	inputContainer: {
		marginBottom: 16,
		marginHorizontal: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 16,
		fontSize: 16,
		backgroundColor: '#f9f9f9',
	},
	passwordHint: {
		fontSize: 12,
		color: '#666',
		marginBottom: 20,
		lineHeight: 16,
	},
	signupButton: {
		backgroundColor: '#007AFF',
		borderRadius: 8,
		padding: 16,
		marginTop: 8,
		marginBottom: 16,
	},
	signupButtonDisabled: {
		backgroundColor: '#ccc',
	},
	signupButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
	},
	loginContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
	},
	loginText: {
		color: '#666',
		fontSize: 14,
	},
	loginLink: {
		color: '#007AFF',
		fontSize: 14,
		fontWeight: '600',
	},
})
