/**
 * TabSegment.tsx
 * 
 * A reusable tab segment component for consistent tab styling across the app
 * 
 * Author: Generated for Project Janatha
 * Date: September 21, 2025
 */

import React from 'react';
import { Button, XStack, useTheme } from 'tamagui';

export interface TabOption {
  value: string;
  label: string;
}

export interface TabSegmentProps {
  options: TabOption[];
  value: string;
  onValueChange: (value: string) => void;
  size?: '$2' | '$3' | '$4';
  variant?: 'primary' | 'subtle';
}

export function TabSegment({ 
  options, 
  value, 
  onValueChange, 
  size = '$3',
  variant = 'primary'
}: TabSegmentProps) {
  const theme = useTheme();
  
  // Color configurations for different variants
  const variantConfig = {
    primary: {
      containerBg: '$cardBackground',
      activeBg: '$primary',
      activeColor: '$backgroundStrong',
      inactiveColor: '$gray10',
      activeHoverBg: '$primaryPress',
      inactiveHoverBg: '$gray4',
      shadow: {
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }
    },
    subtle: {
      containerBg: '$gray2',
      activeBg: '$primary',
      activeColor: '$backgroundStrong', 
      inactiveColor: '$gray10',
      activeHoverBg: '$primaryPress',
      inactiveHoverBg: '$gray4',
      shadow: {}
    }
  };

  const config = variantConfig[variant];

  return (
    <XStack 
      bg={config.containerBg}
      borderRadius="$4" 
      padding="$1"
      gap="$1"
      {...config.shadow}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        
        return (
          <Button
            key={option.value}
            size={size}
            flex={1}
            onPress={() => onValueChange(option.value)}
            bg={isActive ? config.activeBg : "transparent"}
            color={isActive ? config.activeColor : config.inactiveColor}
            fontWeight={isActive ? "600" : "400"}
            borderRadius="$3"
            pressStyle={{ 
              bg: isActive ? config.activeHoverBg : config.inactiveHoverBg,
              opacity: 0.8,
            }}
            hoverStyle={{
              bg: isActive ? config.activeHoverBg : config.inactiveHoverBg,
              opacity: 0.9,
            }}
          >
            {option.label}
          </Button>
        );
      })}
    </XStack>
  );
}

export default TabSegment;
