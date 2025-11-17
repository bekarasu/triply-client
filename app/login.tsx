import { authService } from '@/services/auth/service'
import { ApiError } from '@/services/http-client'
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
		setPassword(text)
	}

	const handleLogin = async () => {
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
						<View style={styles.headerSection}>
							<View style={styles.logoContainer}>
								<Text style={styles.logoText}>✈️</Text>
							</View>
							<Text style={styles.title}>Welcome to Triply</Text>
							<Text style={styles.subtitle}>
								Sign in to start planning your amazing
								adventures
							</Text>
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
		backgroundColor: '#f8f9fa',
	},
	keyboardView: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center',
	},
	headerSection: {
		alignItems: 'center',
		marginBottom: 48,
	},
	logoContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#6366f1',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	logoText: {
		fontSize: 36,
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
		marginBottom: 40,
		color: '#6b7280',
		lineHeight: 26,
		paddingHorizontal: 16,
	},
	inputContainer: {
		marginBottom: 20,
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
	loginButton: {
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
	loginButtonDisabled: {
		backgroundColor: '#d1d5db',
		shadowOpacity: 0.1,
	},
	loginButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
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
		marginTop: 20,
	},
	signupText: {
		color: '#6b7280',
		fontSize: 16,
	},
	signupLink: {
		color: '#6366f1',
		fontSize: 16,
		fontWeight: '700',
	},
})
