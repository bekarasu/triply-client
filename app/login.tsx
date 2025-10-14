import { authService } from '@/services/auth/service'
import { ApiError } from '@/services/http-client'
import { LoggerService } from '@/services/logger'
import { profileService } from '@/services/profile/service'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native'

export default function LoginScreen() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handlePasswordChange = (text: string) => {
		LoggerService.log('Password changed, length:', text.length)
		setPassword(text)
	}

	const handleLogin = async () => {
		LoggerService.log('Login attempt with:', {
			email,
			password: password.length > 0 ? '***' : 'EMPTY',
		})

		if (!email || !password) {
			Alert.alert('Error', 'Please fill in all fields')
			return
		}

		// Debug: Check if password field has content
		if (password.length === 0) {
			Alert.alert('Debug', 'Password field appears to be empty')
			return
		}

		setLoading(true)
		try {
			await authService.login({ email, password })

			const profile = await profileService.getInfo()
			LoggerService.log('User profile fetched:', profile)
			await profileService.storeData(profile)

			// Navigate to main app
			router.replace('/home' as any)
		} catch (error: any) {
			const apiError = error as ApiError
			Alert.alert(
				'Login Failed',
				apiError.message || 'An error occurred during login',
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
					<View style={styles.content}>
						<Text style={styles.title}>Welcome to Triply</Text>
						<Text style={styles.subtitle}>Sign in to continue</Text>

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
								onChangeText={handlePasswordChange}
								secureTextEntry={true}
								autoCapitalize="none"
								autoComplete="password"
								textContentType="oneTimeCode"
								autoCorrect={false}
								blurOnSubmit={false}
								returnKeyType="done"
								onSubmitEditing={handleLogin}
							/>
						</View>

						<TouchableOpacity
							style={[
								styles.loginButton,
								loading && styles.loginButtonDisabled,
							]}
							onPress={handleLogin}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.loginButtonText}>
									Sign In
								</Text>
							)}
						</TouchableOpacity>

						{/* <TouchableOpacity style={styles.forgotPassword}>
					<Text style={styles.forgotPasswordText}>
						Forgot Password?
					</Text>
				</TouchableOpacity> */}

						<View style={styles.signupContainer}>
							<Text style={styles.signupText}>
								Don&apos;t have an account?{' '}
							</Text>
							<TouchableOpacity
								onPress={() => router.push('/signup' as any)}
							>
								<Text style={styles.signupLink}>Sign Up</Text>
							</TouchableOpacity>
						</View>
					</View>
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
	inputContainer: {
		marginBottom: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 16,
		fontSize: 16,
		backgroundColor: '#f9f9f9',
	},
	loginButton: {
		backgroundColor: '#007AFF',
		borderRadius: 8,
		padding: 16,
		marginTop: 8,
		marginBottom: 16,
	},
	loginButtonDisabled: {
		backgroundColor: '#ccc',
	},
	loginButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
	},
	forgotPassword: {
		alignItems: 'center',
		marginBottom: 32,
	},
	forgotPasswordText: {
		color: '#007AFF',
		fontSize: 14,
	},
	signupContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	signupText: {
		color: '#666',
		fontSize: 14,
	},
	signupLink: {
		color: '#007AFF',
		fontSize: 14,
		fontWeight: '600',
	},
})
