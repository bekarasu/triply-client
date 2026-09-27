import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlaceholderColor } from '@/hooks/usePlaceholderColor'
import { authService } from '@/services/auth/service'
import { ApiError } from '@/services/http-client'
import { profileService } from '@/services/profile/service'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View} from 'react-native'

export default function LoginScreen() {
	const placeholderColor = usePlaceholderColor()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const passwordRef = useRef<TextInput>(null)

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert('Error', 'Please fill in all fields')
			return
		}

		// CRITICAL: Dismiss keyboard *before* the async request.
		// This cues the OS that the form submission has started.
		Keyboard.dismiss()
		setLoading(true)

		try {
			await authService.login({ email, password })

			const profile = await profileService.getInfo()
			await profileService.storeData(profile)

			// The OS sees the password field lost focus, followed by a screen transition.
			// This is the heuristic that triggers the "Save Password" prompt.
			router.replace('/home')
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
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled" // Ensures buttons can be pressed while keyboard is up
					>
						<View style={styles.content}>
							<View style={styles.formCard}>
								<View style={styles.headerSection}>
									<View style={styles.logoContainer}>
										<Text style={styles.logoText}>✈️</Text>
									</View>
									<Text style={styles.title}>
										Welcome to Triply
									</Text>
									<Text style={styles.subtitle}>
										Sign in to start planning your amazing
										adventures
									</Text>
								</View>

								<View style={styles.inputContainer}>
									<TextInput
										style={styles.input}
										placeholder="Email"
										placeholderTextColor={placeholderColor}
										value={email}
										onChangeText={setEmail}
										keyboardType="email-address"
										autoCapitalize="none"
										autoCorrect={false}
										// Updated Autofill Props
										autoComplete="email"
										textContentType="emailAddress"
										importantForAutofill="yes"
										returnKeyType="next"
										onSubmitEditing={() =>
											passwordRef.current?.focus()
										}
										blurOnSubmit={false}
									/>
								</View>

								<View style={styles.inputContainer}>
									<TextInput
										ref={passwordRef}
										style={styles.input}
										placeholder="Password"
										placeholderTextColor={placeholderColor}
										value={password}
										onChangeText={setPassword}
										secureTextEntry={true}
										autoCapitalize="none"
										autoCorrect={false}
										// Updated Autofill Props
										autoComplete="password"
										textContentType="password"
										importantForAutofill="yes"
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

								<View style={styles.signupContainer}>
									<Text style={styles.signupText}>
										Don&apos;t have an account?{' '}
									</Text>
									<TouchableOpacity
										onPress={() => router.push('/signup')}
									>
										<Text style={styles.signupLink}>
											Sign Up
										</Text>
									</TouchableOpacity>
								</View>
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
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
		paddingVertical: 20,
	},
	formCard: {
		width: '100%',
		maxWidth: 420,
		alignSelf: 'center',
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
