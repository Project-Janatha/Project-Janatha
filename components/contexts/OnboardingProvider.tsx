import { router, usePathname } from 'expo-router'
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const STEP_ROUTES = [
  '/onboarding/step1',
  '/onboarding/step2',
  '/onboarding/step3',
  '/onboarding/step4',
  '/onboarding/step5',
]

interface OnboardingContextType {
  currentStep: number
  totalSteps: number
  firstName: string
  lastName: string
  birthdate: Date | null
  location: [number, number] | null
  phoneNumber: string
  interests: string[]
  goToNextStep: () => void
  goToPreviousStep: () => void
  setFirstName: (name: string) => void
  setLastName: (name: string) => void
  setBirthdate: (date: Date) => void
  setLocation: (location: [number, number] | null) => void
  setPhoneNumber: (phoneNumber: string) => void
  setInterests: (interests: string[]) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export default function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const totalSteps = STEP_ROUTES.length
  const currStepIdx = STEP_ROUTES.indexOf(pathname)
  const currentStep = currStepIdx === -1 ? 1 : currStepIdx + 1

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthdate, setBirthdate] = useState<Date | null>(null)
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  // Track if navigation is in progress
  const isNavigating = useRef(false)

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      router.push(STEP_ROUTES[currentStep] as any) // Use currentStep as index (already 0-indexed for next route)
    } else {
      router.replace('/')
    }
  }

  const goToPreviousStep = () => {
    if (isNavigating.current) return

    isNavigating.current = true

    if (currentStep > 1) {
      router.back()
    }

    setTimeout(() => {
      isNavigating.current = false
    }, 500)
  }

  const value = {
    currentStep,
    totalSteps,
    firstName,
    lastName,
    birthdate,
    location,
    phoneNumber,
    interests,
    goToNextStep,
    goToPreviousStep,
    setFirstName,
    setLastName,
    setBirthdate,
    setLocation,
    setPhoneNumber,
    setInterests,
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
