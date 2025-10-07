import React from 'react';
import { XStack, YStack, Text, Progress } from 'tamagui';
import { Check, XCircle } from '@tamagui/lucide-icons';

interface PasswordRequirementsProps {
  password: string;
  showRequirements: boolean;
  compact?: boolean;
}
// Calculate password strength based on the UIC password scoring system [https://www.uic.edu/apps/strong-password/]
const calculatePasswordStrength = (password: string): {score: number, label: string, color: string} => {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 10) score++;
  if (password.length >= 12) score++;
  if (password.length >= 15) score++;

  // Character variety scoring
  if (/[a-z]/.test(password)) score++; // lowercase
  if (/[A-Z]/.test(password)) score++; // uppercase
  if (/[0-9]/.test(password)) score++; // digits
  if (/[^A-Za-z0-9]/.test(password)) score++; // special characters

  // Bonus points
  if (/[A-Za-z]/.test(password)) score++; // Mixed case
  if(/\d/.test(password) && /[A-Za-z]/.test(password)) score++; // Letters and numbers

  // Deductions
  if (/^\d+$/.test(password)) score -= 2; // only numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 1; // only letters

  // Score must be positive
  score = Math.max(0, score);

  // Map score to strengths
  if (score <= 2) return { score, label: 'Very Weak', color: '$red10' };
  if (score <= 4) return { score, label: 'Weak', color: '$red9' };
  if (score <= 6) return { score, label: 'Fair', color: '$orange9' };
  if (score <= 8) return { score, label: 'Good', color: '$yellow9' };
  if (score <= 10) return { score, label: 'Strong', color: '$green9' };
  return { score, label: 'Very Strong', color: '$green10' };
};
