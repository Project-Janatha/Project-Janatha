import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextType {
  branch: 'chyk' | 'admin' | null;
  birthdate: Date | null;
  avatarUrl: string | null;
  name: string;
  bio: string;
  interests: string[];
  setBranch: (branch: 'chyk' | 'admin') => void;
  setBirthdate: (date: Date) => void;
  setAvatarUrl: (url: string) => void;
  setName: (name: string) => void;
  setBio: (bio: string) => void;
  setInterests: (interests: string[]) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [branch, setBranch] = useState<'chyk' | 'admin' | null>(null);
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // include default avatar URL if needed
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  // package all state and setters into a single value
  const value = {
    branch,
    birthdate,
    avatarUrl,
    name,
    bio,
    interests,
    setBranch,
    setBirthdate,
    setAvatarUrl,
    setName,
    setBio,
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