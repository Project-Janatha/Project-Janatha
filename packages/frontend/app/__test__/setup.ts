import '@testing-library/jest-native/extend-expect';

// Optional: Mock expo-router if your components navigate or use Layouts
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  Slot: 'Slot',
  Stack: 'Stack',
}));
