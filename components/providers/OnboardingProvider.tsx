import { Lasso } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  firstName: string;
  lastName: string;
  birthdate: Date | null;
  location: [number, number] | null; // [latitude, longitude]
  phoneNumber: string;
  interests: string[];
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setBirthdate: (date: Date) => void;
  setLocation: (location: [number, number] | null) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setInterests: (interests: string[]) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5; // Adjust based on actual number of steps
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [location, setLocation] = useState<[number, number] | null>(null); // [latitude, longitude]
  const [phoneNumber, setPhoneNumber] = useState(''); // Implement phone number OTP verification later
  const [interests, setInterests] = useState<string[]>([]);

  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep < totalSteps) {
      setCurrentStep(nextStep);
      router.push(`/onboarding/step${nextStep}` as any);
    } else {
      router.replace('/');
    }
  };

  const goToPreviousStep = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
      router.push(`/onboarding/step${prevStep}` as any);
    }
  };

  const value = {
    currentStep,
    totalSteps,
    firstName,
    lastName,
    birthdate,
    location,
    phoneNumber,
    interests,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    setFirstName,
    setLastName,
    setBirthdate,
    setLocation,
    setPhoneNumber,
    setInterests,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

// custom hook for accessing onboarding context values
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}