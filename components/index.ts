/**
 * index.ts
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * Author: Abhiram Ramachandran
 * Date Authored: September 2, 2025
 * Last Date Modified: September 2, 2025
 * 
 * This file exports all components.
 * 
 */
import { styled, Button, Input } from 'tamagui';

// Base button with consistent hover/press behavior
const BaseButton = styled(Button, {
  name: 'BaseButton',
  
  hoverStyle: {
    opacity: 0.9,
  },
  pressStyle: {
    opacity: 0.8,
    scale: 0.98,
  },
  variants: {
    disabled: {
      true: {
        opacity: 0.6,
        pointerEvents: 'none',
      }
    }
  }
});

// Primary button - main call-to-action
export const PrimaryButton = styled(BaseButton, {
  name: 'PrimaryButton',
  backgroundColor: '$primary',
  color: '$backgroundStrong',
  fontWeight: '600',

  hoverStyle: {
    backgroundColor: '$primaryPress',
    opacity: 1,
  },
  pressStyle: {
    backgroundColor: '$primaryPress',
    opacity: 0.9,
    scale: 0.98,
  },
});

// Secondary button - outlined style
export const SecondaryButton = styled(BaseButton, {
  name: 'SecondaryButton',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: 'transparent',
  color: '$color',

  hoverStyle: {
    backgroundColor: '$gray2',
    borderColor: '$borderColorHover',
    opacity: 1,
  },
  pressStyle: {
    backgroundColor: '$gray4',
    scale: 0.98,
    opacity: 1,
  },
});

// Destructive button - for dangerous actions
export const DestructiveButton = styled(BaseButton, {
  name: 'DestructiveButton',
  backgroundColor: '$red9',
  color: '$backgroundStrong',
  fontWeight: '600',

  hoverStyle: {
    backgroundColor: '$red10',
    opacity: 1,
  },
  pressStyle: {
    backgroundColor: '$red10',
    opacity: 0.9,
    scale: 0.98,
  },
});

// Ghost button - minimal style
export const GhostButton = styled(BaseButton, {
  name: 'GhostButton',
  backgroundColor: 'transparent',
  color: '$color',

  hoverStyle: {
    backgroundColor: '$gray2',
    opacity: 1,
  },
  pressStyle: {
    backgroundColor: '$gray4',
    scale: 0.98,
    opacity: 1,
  },
});

// Icon button - for icon-only buttons
export const IconButton = styled(BaseButton, {
  name: 'IconButton',
  backgroundColor: 'transparent',
  color: '$gray10',
  padding: '$2',

  hoverStyle: {
    backgroundColor: '$gray2',
    color: '$color',
    opacity: 1,
  },
  pressStyle: {
    backgroundColor: '$gray4',
    scale: 0.95,
    opacity: 1,
  },

  variants: {
    variant: {
      outlined: {
        borderWidth: 1,
        borderColor: '$borderColor',
        
        hoverStyle: {
          borderColor: '$borderColorHover',
          backgroundColor: '$gray2',
        },
      },
      solid: {
        backgroundColor: '$gray4',
        
        hoverStyle: {
          backgroundColor: '$gray6',
        },
      }
    }
  }
});

export const AuthInput = styled(Input, {
  name: 'AuthInput',
  backgroundColor: '$gray', // Shaded background
  color: '$color',
  borderWidth: 0, // Add borderWidth to the default state
  // borderColor: '$gray4',
});
  
export { default as Provider } from './providers/Provider';
export { default as Map } from './Map';
export { default as SearchBar } from './SearchBar';
export { default as TabSegment } from './TabSegment';
export { default as UserProvider, UserContext } from './providers/UserProvider';