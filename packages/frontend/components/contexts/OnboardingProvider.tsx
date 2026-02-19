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
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5 // Total form steps (not including Complete screen)
  const { updateProfile } = useUser()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthdate, setBirthdate] = useState<Date | null>(null)
  const [centerID, setCenterID] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  const goToNextStep = () => {
    // Allow incrementing past totalSteps to show Complete screen
    setCurrentStep((prev) => prev + 1)
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    // Persist onboarding completion so RootLayout doesn't bounce back here.
    await updateProfile({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      centerID: centerID || undefined,
      profileComplete: true,
    })
    router.replace('/(tabs)')
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
