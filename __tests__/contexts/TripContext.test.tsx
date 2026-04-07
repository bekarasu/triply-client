import React from 'react'
import { renderHook, act } from '@testing-library/react-native'
import {
	TripProvider,
	useTripContext,
	clearTripDataGlobally,
	CityWithCriteria,
} from '@/contexts/TripContext'
import { City } from '@/services/city/types'

describe('TripContext', () => {
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<TripProvider>{children}</TripProvider>
	)

	const mockCity: City = {
		id: 1,
		name: 'Paris',
		country: { id: 1, name: 'France', iso2: 'FR' },
		latitude: 48.8566,
		longitude: 2.3522,
	}

	const mockCityWithCriteria: CityWithCriteria = {
		city: mockCity,
		data: {
			budget: 1000,
			duration: 5,
			criterias: [{ id: 1, name: 'Culture' }],
		},
	}

	describe('useTripContext', () => {
		it('throws error when used outside TripProvider', () => {
			expect(() => {
				renderHook(() => useTripContext())
			}).toThrow('useTripContext must be used within a TripProvider')
		})

		it('provides initial state', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			expect(result.current.selectedCity).toBeNull()
			expect(result.current.selectedCities).toEqual([])
			expect(result.current.tripStartDate).toBeInstanceOf(Date)
			expect(result.current.tripDetails).toBeNull()
		})
	})

	describe('setSelectedCity', () => {
		it('sets selected city', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.setSelectedCity(mockCity)
			})

			expect(result.current.selectedCity).toEqual(mockCity)
		})

		it('can set selected city to null', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.setSelectedCity(mockCity)
			})

			act(() => {
				result.current.setSelectedCity(null)
			})

			expect(result.current.selectedCity).toBeNull()
		})
	})

	describe('setSelectedCities', () => {
		it('sets selected cities array', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.setSelectedCities([mockCityWithCriteria])
			})

			expect(result.current.selectedCities).toEqual([mockCityWithCriteria])
		})
	})

	describe('setTripStartDate', () => {
		it('sets trip start date', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })
			const newDate = new Date('2024-06-15')

			act(() => {
				result.current.setTripStartDate(newDate)
			})

			expect(result.current.tripStartDate).toEqual(newDate)
		})
	})

	describe('setTripDetails', () => {
		it('sets trip details', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })
			const tripDetails = {
				id: '1',
				name: 'My Trip',
				days: [],
				startDate: '2024-06-15',
				endDate: '2024-06-20',
			}

			act(() => {
				result.current.setTripDetails(tripDetails as any)
			})

			expect(result.current.tripDetails).toEqual(tripDetails)
		})

		it('can set trip details to null', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.setTripDetails({ id: '1' } as any)
			})

			act(() => {
				result.current.setTripDetails(null)
			})

			expect(result.current.tripDetails).toBeNull()
		})
	})

	describe('addCity', () => {
		it('adds city to selected cities', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.addCity(mockCityWithCriteria)
			})

			expect(result.current.selectedCities).toHaveLength(1)
			expect(result.current.selectedCities[0]).toEqual(mockCityWithCriteria)
		})

		it('adds multiple cities', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			const secondCity: CityWithCriteria = {
				city: { ...mockCity, id: 2, name: 'Rome' },
				data: { budget: 800, duration: 3, criterias: [] },
			}

			act(() => {
				result.current.addCity(mockCityWithCriteria)
			})

			act(() => {
				result.current.addCity(secondCity)
			})

			expect(result.current.selectedCities).toHaveLength(2)
		})
	})

	describe('removeCity', () => {
		it('removes city by id', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.addCity(mockCityWithCriteria)
			})

			act(() => {
				result.current.removeCity(mockCity.id)
			})

			expect(result.current.selectedCities).toHaveLength(0)
		})

		it('does nothing when city id not found', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.addCity(mockCityWithCriteria)
			})

			act(() => {
				result.current.removeCity(999)
			})

			expect(result.current.selectedCities).toHaveLength(1)
		})
	})

	describe('reorderCities', () => {
		it('reorders cities', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			const secondCity: CityWithCriteria = {
				city: { ...mockCity, id: 2, name: 'Rome' },
				data: { budget: 800, duration: 3, criterias: [] },
			}

			act(() => {
				result.current.addCity(mockCityWithCriteria)
				result.current.addCity(secondCity)
			})

			act(() => {
				result.current.reorderCities([secondCity, mockCityWithCriteria])
			})

			expect(result.current.selectedCities[0].city.name).toBe('Rome')
			expect(result.current.selectedCities[1].city.name).toBe('Paris')
		})
	})

	describe('clearTripData', () => {
		it('clears all trip data', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.setSelectedCity(mockCity)
				result.current.addCity(mockCityWithCriteria)
				result.current.setTripDetails({ id: '1' } as any)
			})

			act(() => {
				result.current.clearTripData()
			})

			expect(result.current.selectedCity).toBeNull()
			expect(result.current.selectedCities).toEqual([])
			expect(result.current.tripDetails).toBeNull()
		})
	})

	describe('clearTripDataGlobally', () => {
		it('clears trip data via global function', () => {
			const { result } = renderHook(() => useTripContext(), { wrapper })

			act(() => {
				result.current.addCity(mockCityWithCriteria)
			})

			act(() => {
				clearTripDataGlobally()
			})

			expect(result.current.selectedCities).toEqual([])
		})

		it('does nothing when no provider is mounted', () => {
			// Clear any existing global reference
			jest.isolateModules(() => {
				const { clearTripDataGlobally } = require('@/contexts/TripContext')
				// Should not throw when called without a provider
				expect(() => clearTripDataGlobally()).not.toThrow()
			})
		})
	})
})
