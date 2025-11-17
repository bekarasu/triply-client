// Trip Context - Global state management for trip data in memory
import React, { createContext, ReactNode, useContext, useState } from 'react'
import { City } from '../services/city/types'
import { Criteria } from '../services/recommendation/types'

export interface CityWithCriteria {
	city: City
	data: {
		budget: number
		duration: number
		criterias: Criteria[]
	}
}

interface TripContextData {
	selectedCities: CityWithCriteria[]
	tripStartDate: Date
	setSelectedCities: (cities: CityWithCriteria[]) => void
	setTripStartDate: (date: Date) => void
	clearTripData: () => void
	addCity: (city: CityWithCriteria) => void
	removeCity: (cityId: number) => void
	reorderCities: (reorderedCities: CityWithCriteria[]) => void
}

const TripContext = createContext<TripContextData | undefined>(undefined)

// Global reference to the clear function for use in logout
let globalClearTripData: (() => void) | null = null

export const clearTripDataGlobally = () => {
	if (globalClearTripData) {
		globalClearTripData()
	}
}

interface TripProviderProps {
	children: ReactNode
}

export function TripProvider({ children }: TripProviderProps) {
	const [selectedCities, setSelectedCities] = useState<CityWithCriteria[]>([])
	const [tripStartDate, setTripStartDate] = useState<Date>(new Date())

	const clearTripData = () => {
		setSelectedCities([])
		setTripStartDate(new Date())
	}

	// Set the global reference
	globalClearTripData = clearTripData

	const addCity = (city: CityWithCriteria) => {
		setSelectedCities((prev) => [...prev, city])
	}

	const removeCity = (cityId: number) => {
		setSelectedCities((prev) =>
			prev.filter((city) => city.city.id !== cityId),
		)
	}

	const reorderCities = (reorderedCities: CityWithCriteria[]) => {
		setSelectedCities(reorderedCities)
	}

	const value: TripContextData = {
		selectedCities,
		tripStartDate,
		setSelectedCities,
		setTripStartDate,
		clearTripData,
		addCity,
		removeCity,
		reorderCities,
	}

	return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTripContext() {
	const context = useContext(TripContext)
	if (context === undefined) {
		throw new Error('useTripContext must be used within a TripProvider')
	}
	return context
}
