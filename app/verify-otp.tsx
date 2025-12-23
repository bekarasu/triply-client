import { usePlaceholderColor } from '@/hooks/usePlaceholderColor'
import { authService } from '@/services/auth/service'
import { ApiError } from '@/services/http-client'
import { Logger } from '@/services/logger'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'

export default function VerifyOtpScreen() {
	const placeholderColor = usePlaceholderColor()
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
			await authService.verifyOtp({
				otpCode,
				otpToken,
			})

			router.replace('/home')
		} catch (error: any) {
			Logger.error('OTP verification error:', error)
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
						placeholderTextColor={placeholderColor}
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
		backgroundColor: '#f8f9fa',
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: 'center',
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
	otpContainer: {
		marginBottom: 40,
	},
	otpInput: {
		borderWidth: 2,
		borderColor: '#6366f1',
		borderRadius: 16,
		paddingHorizontal: 20,
		paddingVertical: 24,
		fontSize: 28,
		fontWeight: '800',
		backgroundColor: '#fff',
		letterSpacing: 4,
		color: '#1f2937',
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	verifyButton: {
		backgroundColor: '#6366f1',
		borderRadius: 16,
		paddingVertical: 18,
		marginBottom: 32,
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	verifyButtonDisabled: {
		backgroundColor: '#d1d5db',
		shadowOpacity: 0.1,
	},
	verifyButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
		textAlign: 'center',
	},
	resendContainer: {
		alignItems: 'center',
		marginBottom: 40,
	},
	resendText: {
		color: '#6366f1',
		fontSize: 17,
		fontWeight: '700',
	},
	timerText: {
		color: '#6b7280',
		fontSize: 17,
		fontWeight: '500',
	},
	backButton: {
		alignItems: 'center',
		paddingVertical: 12,
	},
	backButtonText: {
		color: '#6b7280',
		fontSize: 16,
		fontWeight: '500',
	},
})
