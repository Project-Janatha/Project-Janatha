import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextType {
  branch: 'chyk' | 'admin' | null;
  birthdate: Date | null;
  firstName: string;
  lastName: string;
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setBranch: (branch: 'chyk' | 'admin') => void;
  setBirthdate: (date: Date) => void;
}