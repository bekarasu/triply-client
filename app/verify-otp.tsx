import React, { useState, useEffect, useRef } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	Alert,
	ActivityIndicator,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { authService } from '@/services/auth-service'
import { ApiError } from '@/services/http-client'

export default function VerifyOtpScreen() {
	const [otpCode, setOtpCode] = useState('')
	const [loading, setLoading] = useState(false)
	const [resendLoading, setResendLoading] = useState(false)
	const [timer, setTimer] = useState(60)
	const [canResend, setCanResend] = useState(false)
	const router = useRouter()
	const { otpToken, email } = useLocalSearchParams<{
		otpToken: string
		email: string
	}>()

	const otpInputRef = useRef<TextInput>(null)

	useEffect(() => {
		// Auto-focus on OTP input
		setTimeout(() => {
			otpInputRef.current?.focus()
		}, 500)

		// Start countdown timer
		const countdown = setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					setCanResend(true)
					clearInterval(countdown)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(countdown)
	}, [])

	const handleVerifyOtp = async () => {
		if (!otpCode || otpCode.length !== 6) {
			Alert.alert('Error', 'Please enter a valid 6-digit OTP code')
			return
		}

		if (!otpToken) {
			Alert.alert(
				'Error',
				'Missing OTP token. Please try registration again.',
			)
			return
		}

		setLoading(true)
		try {
			const response = await authService.verifyOtp({
				otpCode,
				otpToken,
			})

			console.log('OTP verification successful:', response)
			Alert.alert('Success', 'Account created successfully!', [
				{
					text: 'OK',
					onPress: () => router.replace('/home' as any),
				},
			])
		} catch (error: any) {
			console.error('OTP verification error:', error)
			const apiError = error as ApiError
			Alert.alert(
				'Verification Failed',
				apiError.message || 'Invalid OTP code. Please try again.',
			)
		} finally {
			setLoading(false)
		}
	}

	const handleResendOtp = async () => {
		if (!email) {
			Alert.alert(
				'Error',
				'Email not found. Please try registration again.',
			)
			return
		}

		setResendLoading(true)
		try {
			await authService.resendOtp(email)
			Alert.alert('Success', 'OTP has been resent to your email')

			// Reset timer
			setTimer(60)
			setCanResend(false)

			// Start countdown again
			const countdown = setInterval(() => {
				setTimer((prev) => {
					if (prev <= 1) {
						setCanResend(true)
						clearInterval(countdown)
						return 0
					}
					return prev - 1
				})
			}, 1000)
		} catch (error: any) {
			console.error('Resend OTP error:', error)
			const apiError = error as ApiError
			Alert.alert(
				'Resend Failed',
				apiError.message || 'Failed to resend OTP. Please try again.',
			)
		} finally {
			setResendLoading(false)
		}
	}

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Verify Your Email</Text>
				<Text style={styles.subtitle}>
					We&apos;ve sent a 6-digit code to {email}
				</Text>

				<View style={styles.otpContainer}>
					<TextInput
						ref={otpInputRef}
						style={styles.otpInput}
						placeholder="Enter 6-digit code"
						value={otpCode}
						onChangeText={(text) => {
							// Only allow numbers and limit to 6 digits
							const numericText = text
								.replace(/[^0-9]/g, '')
								.substring(0, 6)
							setOtpCode(numericText)
						}}
						keyboardType="numeric"
						maxLength={6}
						textAlign="center"
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>

				<TouchableOpacity
					style={[
						styles.verifyButton,
						loading && styles.verifyButtonDisabled,
					]}
					onPress={handleVerifyOtp}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={styles.verifyButtonText}>
							Verify & Continue
						</Text>
					)}
				</TouchableOpacity>

				<View style={styles.resendContainer}>
					{canResend ? (
						<TouchableOpacity
							onPress={handleResendOtp}
							disabled={resendLoading}
						>
							<Text style={styles.resendText}>
								{resendLoading ? 'Sending...' : 'Resend Code'}
							</Text>
						</TouchableOpacity>
					) : (
						<Text style={styles.timerText}>
							Resend code in {formatTime(timer)}
						</Text>
					)}
				</View>

				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
				>
					<Text style={styles.backButtonText}>
						Back to Registration
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
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
		lineHeight: 24,
	},
	otpContainer: {
		marginBottom: 32,
	},
	otpInput: {
		borderWidth: 2,
		borderColor: '#007AFF',
		borderRadius: 12,
		padding: 20,
		fontSize: 24,
		fontWeight: 'bold',
		backgroundColor: '#f9f9f9',
		letterSpacing: 8,
	},
	verifyButton: {
		backgroundColor: '#007AFF',
		borderRadius: 8,
		padding: 16,
		marginBottom: 24,
	},
	verifyButtonDisabled: {
		backgroundColor: '#ccc',
	},
	verifyButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
	},
	resendContainer: {
		alignItems: 'center',
		marginBottom: 32,
	},
	resendText: {
		color: '#007AFF',
		fontSize: 16,
		fontWeight: '600',
	},
	timerText: {
		color: '#666',
		fontSize: 16,
	},
	backButton: {
		alignItems: 'center',
	},
	backButtonText: {
		color: '#666',
		fontSize: 14,
	},
})
