import { createContext, useContext, useState } from 'react'
import { router } from 'expo-router'
import { useUser } from './UserContext'

interface OnboardingContextType {
  currentStep: number
  totalSteps: number
  firstName: string
  lastName: string
  birthdate: Date | null
  centerID: string
  phoneNumber: string
  interests: string[]
  isSubmitting: boolean
  submitError: string | null
  goToNextStep: () => void
  goToPreviousStep: () => void
  completeOnboarding: () => void
  setFirstName: (name: string) => void
  setLastName: (name: string) => void
  setBirthdate: (date: Date) => void
  setCenterID: (id: string) => void
  setPhoneNumber: (phoneNumber: string) => void
  setInterests: (interests: string[]) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export default function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, authenticatedFetch } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5 // Total form steps (not including Complete screen)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthdate, setBirthdate] = useState<Date | null>(null)
  const [centerID, setCenterID] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const goToNextStep = () => {
    // Allow incrementing past totalSteps to show Complete screen
    setCurrentStep(currentStep + 1)
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await authenticatedFetch('/api/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.username,
          firstName,
          lastName,
          dateOfBirth: birthdate?.toISOString() || null,
          centerID,
          profileComplete: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to complete onboarding')
      }

      // Update UserContext so the route guard redirects to home
      setUser({ ...user!, firstName, lastName, centerID, profileComplete: true })
      router.replace('/')
    } catch (error: any) {
      setSubmitError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    currentStep,
    totalSteps,
    firstName,
    lastName,
    birthdate,
    centerID,
    phoneNumber,
    interests,
    isSubmitting,
    submitError,
    goToNextStep,
    goToPreviousStep,
    completeOnboarding,
    setFirstName,
    setLastName,
    setBirthdate,
    setCenterID,
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
