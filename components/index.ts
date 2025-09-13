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

export const PrimaryButton = styled(Button, {
  name: 'PrimaryButton',
  bg: '$primary',
  color: 'white',

  pressStyle: {
    bg: '$primaryPress',
    scale: 0.97,
  },
  hoverStyle: {
    bg: '$primaryPress',
    scale: 0.97,
  },
});

export const AuthInput = styled(Input, {
  name: 'AuthInput',
  background: '$gray', // Shaded background
  color: '$color',
  borderWidth: 0, // Add borderWidth to the default state
  // borderColor: '$gray4',
});
  
export { default as Provider } from './providers/Provider';
export { default as Map } from './Map';
export { default as SearchBar } from './SearchBar';
export { default as UserProvider, UserContext } from './providers/UserProvider';