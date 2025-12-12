import { Criteria } from '@/services/recommendation/types'
import React, { useCallback, useState } from 'react'
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { City } from '../services/city/types'

interface CriteriaModalProps {
	visible: boolean
	city: City | null
	criterias?: Criteria[]
	onClose: () => void
	onSubmit: (
		city: City,
		criteria: {
			budget: string
			duration: string
			criterias: Criteria[]
		},
	) => void
}

export default function CriteriaModal({
	visible,
	city,
	criterias: recommendationCriterias = [],
	onClose,
	onSubmit,
}: CriteriaModalProps) {
	const [budget, setBudget] = useState('')
	const [duration, setDuration] = useState('')
	const [selectedCriterias, setSelectedCriterias] = useState<Criteria[]>([])

	const resetForm = () => {
		setBudget('')
		setDuration('')
		setSelectedCriterias([])
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	const handleBudgetChange = (text: string) => {
		// Immediately reject any input that doesn't match our pattern
		if (text !== '' && !/^[0-9]*\.?[0-9]*$/.test(text)) {
			return // Don't update state at all - character won't appear
		}

		// Prevent multiple decimal points
		const decimalCount = (text.match(/\./g) || []).length
		if (decimalCount > 1) {
			return
		}

		// Prevent decimal point at the beginning
		if (text.startsWith('.')) {
			return
		}

		setBudget(text)
	}

	const handleCriteriaToggle = useCallback((criteria: Criteria) => {
		setSelectedCriterias((prev) => {
			const exists = prev.find((r) => r.id === criteria.id)
			if (exists) {
				// Remove if already selected
				return prev.filter((r) => r.id !== criteria.id)
			} else {
				// Add with default priority
				return [...prev, criteria]
			}
		})
	}, [])

	const handleDurationChange = (text: string) => {
		// Immediately reject any input that contains non-digits
		if (text !== '' && !/^\d*$/.test(text)) {
			return // Don't update state at all - character won't appear
		}

		setDuration(text)
	}

	const handleSubmit = () => {
		if (!city) return

		if (!budget.trim()) {
			Alert.alert(
				'Missing Information',
				'Please enter a budget for this city.',
			)
			return
		}

		if (!duration.trim()) {
			Alert.alert(
				'Missing Information',
				'Please enter how long you want to stay in this city.',
			)
			return
		}

		if (selectedCriterias.length === 0) {
			Alert.alert(
				'Missing Information',
				'Please select at least one activity you want to do in this city.',
			)
			return
		}

		onSubmit(city, {
			budget: budget.trim(),
			duration: duration.trim(),
			criterias: selectedCriterias,
		})

		resetForm()
	}

	const getCategoryColor = (category: string): string => {
		const colors = {
			budget: '#4CAF50',
			duration: '#2196F3',
			activity: '#FF9800',
			accommodation: '#9C27B0',
			transport: '#607D8B',
		}
		return colors[category as keyof typeof colors] || '#666'
	}

	if (!city) return null

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="fullScreen"
			onRequestClose={handleClose}
		>
			<View style={styles.modalContainer}>
				{/* <View style={styles.modalHeader}>
					<Text style={styles.modalTitle}>Add City Details</Text>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={handleClose}
					>
						<Text style={styles.closeButtonText}>✕</Text>
					</TouchableOpacity>
				</View> */}

				<ScrollView
					style={styles.content}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.header}>
						<Text style={styles.title}>Trip Details for</Text>
						<Text style={styles.cityTitle}>
							{city.name}, {city.country.name}
						</Text>
						<Text style={styles.subtitle}>
							Plan your visit to this city within your overall
							trip
						</Text>
					</View>

					<View style={styles.section}>
						<Text style={styles.label}>Total Budget (per person)</Text>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.textInputWithSuffix}
								placeholder="0"
								value={budget}
								onChangeText={handleBudgetChange}
								keyboardType="decimal-pad"
							/>
							<Text style={styles.currencySymbol}>$</Text>
						</View>
					</View>

					<View style={styles.section}>
						<Text style={styles.label}>Duration (days)</Text>
						<TextInput
							style={styles.textInput}
							placeholder="0"
							value={duration}
							onChangeText={handleDurationChange}
							keyboardType="number-pad"
						/>
					</View>

					<View style={styles.section}>
						<Text style={styles.label}>Activities & Interests</Text>
						<Text style={styles.subtitle}>
							Select what you want to do in this city:
						</Text>
						{recommendationCriterias.length > 0 ? (
							<View>
								{Object.entries(
									recommendationCriterias.reduce(
										(acc, criteria) => {
											const category = criteria.category
											if (!acc[category]) {
												acc[category] = []
											}
											acc[category].push(criteria)
											return acc
										},
										{} as Record<string, Criteria[]>,
									),
								).map(([category, categoryCriterias]) => (
									<View
										key={category}
										style={styles.categorySection}
									>
										<View style={styles.categoryHeader}>
											<View
												style={[
													styles.categoryIndicator,
													{
														backgroundColor:
															getCategoryColor(
																category,
															),
													},
												]}
											/>
											<Text style={styles.categoryTitle}>
												{category
													.charAt(0)
													.toUpperCase() +
													category.slice(1)}
											</Text>
										</View>
										<View style={styles.criteriaGrid}>
											{categoryCriterias.map(
												(criteria) => {
													const isSelected =
														selectedCriterias.some(
															(r) =>
																r.id ===
																criteria.id,
														)
													return (
														<TouchableOpacity
															key={criteria.id}
															style={[
																styles.criteriaCard,
																isSelected &&
																	styles.criteriaCardSelected,
															]}
															onPress={() =>
																handleCriteriaToggle(
																	criteria,
																)
															}
														>
															<Text
																style={
																	styles.criteriaIcon
																}
															>
																{criteria.icon}
															</Text>
															<Text
																style={[
																	styles.criteriaName,
																	isSelected &&
																		styles.criteriaNameSelected,
																]}
															>
																{criteria.name}
															</Text>
															<Text
																style={[
																	styles.criteriaDescription,
																	isSelected &&
																		styles.criteriaDescriptionSelected,
																]}
															>
																{
																	criteria.description
																}
															</Text>
														</TouchableOpacity>
													)
												},
											)}
										</View>
									</View>
								))}
							</View>
						) : (
							<Text style={styles.loadingText}>
								Loading activities...
							</Text>
						)}
					</View>
				</ScrollView>

				<View style={styles.fixedButtonContainer}>
					<TouchableOpacity
						style={styles.cancelButton}
						onPress={handleClose}
					>
						<Text style={styles.cancelButtonText}>Cancel</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.submitButton}
						onPress={handleSubmit}
					>
						<Text style={styles.submitButtonText}>Add City</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingVertical: 16,
		backgroundColor: '#ffffff',
		borderBottomWidth: 1,
		borderBottomColor: '#e5e7eb',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#f3f4f6',
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeButtonText: {
		fontSize: 18,
		color: '#6b7280',
		fontWeight: '600',
	},
	container: {
		flex: 1,
		backgroundColor: '#f8f9fa',
	},
	content: {
		flex: 1,
	},
	scrollContent: {
		padding: 24,
		paddingBottom: 20,
	},
	header: {
		alignItems: 'center',
		marginBottom: 32,
		paddingTop: 36,
	},
	title: {
		fontSize: 18,
		color: '#6b7280',
		marginBottom: 8,
		fontWeight: '500',
	},
	cityTitle: {
		fontSize: 28,
		fontWeight: '800',
		color: '#1f2937',
		textAlign: 'center',
		letterSpacing: -0.5,
	},
	section: {
		marginBottom: 32,
	},
	label: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 15,
		color: '#6b7280',
		marginBottom: 16,
		lineHeight: 22,
	},
	textInput: {
		backgroundColor: '#fff',
		borderRadius: 16,
		paddingHorizontal: 20,
		paddingVertical: 18,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
		color: '#1f2937',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#f1f5f9',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	textInputWithSuffix: {
		flex: 1,
		paddingHorizontal: 20,
		paddingVertical: 18,
		fontSize: 16,
		backgroundColor: 'transparent',
		color: '#1f2937',
	},
	currencySymbol: {
		paddingHorizontal: 20,
		fontSize: 16,
		color: '#6b7280',
		fontWeight: '600',
	},
	activitiesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	activityChip: {
		backgroundColor: '#fff',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: '#f1f5f9',
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	selectedChip: {
		backgroundColor: '#6366f1',
		borderColor: '#6366f1',
		shadowColor: '#6366f1',
		shadowOpacity: 0.3,
	},
	activityText: {
		fontSize: 14,
		color: '#1f2937',
		fontWeight: '600',
	},
	selectedText: {
		color: '#fff',
	},
	fixedButtonContainer: {
		flexDirection: 'row',
		padding: 24,
		paddingBottom: 40,
		gap: 16,
		borderTopWidth: 1,
		borderTopColor: '#e5e7eb',
		backgroundColor: '#ffffff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	buttonContainer: {
		flexDirection: 'row',
		padding: 24,
		paddingBottom: 40,
		gap: 16,
		borderTopWidth: 1,
		borderTopColor: '#e5e7eb',
		backgroundColor: '#ffffff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: '#f3f4f6',
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#d1d5db',
	},
	cancelButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#374151',
	},
	submitButton: {
		flex: 1,
		backgroundColor: '#6366f1',
		paddingVertical: 20,
		borderRadius: 12,
		alignItems: 'center',
		shadowColor: '#6366f1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff',
	},
	loadingText: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		fontStyle: 'italic',
		padding: 20,
	},
	categorySection: {
		marginBottom: 24,
	},
	categoryHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	categoryIndicator: {
		width: 4,
		height: 20,
		borderRadius: 2,
		marginRight: 8,
	},
	categoryTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1f2937',
		textTransform: 'capitalize',
	},
	criteriaGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	criteriaCard: {
		backgroundColor: '#f8f9fa',
		padding: 8,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#e9ecef',
		position: 'relative',
		width: '32%',
		minHeight: 120,
		maxHeight: 120,
	},
	criteriaCardSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#f0f8ff',
	},
	criteriaIcon: {
		fontSize: 16,
		marginBottom: 8,
	},
	criteriaName: {
		fontSize: 12,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	criteriaNameSelected: {
		color: '#007AFF',
	},
	criteriaDescription: {
		fontSize: 10,
		color: '#666',
		marginBottom: 8,
	},
	criteriaDescriptionSelected: {
		color: '#555',
	},
	citiesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	additionalCityCard: {
		backgroundColor: '#f8f9fa',
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e9ecef',
		minWidth: '45%',
		maxWidth: '45%',
		wordWrap: 'break-word',
	},
	additionalCityCardSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#f0f8ff',
	},
	additionalCityName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		marginBottom: 2,
	},
	additionalCityNameSelected: {
		color: '#007AFF',
	},
	additionalCityCountry: {
		fontSize: 12,
		color: '#666',
	},
	additionalCityCountrySelected: {
		color: '#555',
	},
	createButton: {
		backgroundColor: '#007AFF',
		padding: 16,
		borderRadius: 12,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 40,
	},
	createButtonDisabled: {
		backgroundColor: '#ccc',
	},
	createButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
})
