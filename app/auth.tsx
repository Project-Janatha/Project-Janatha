import React, { useState, useContext } from 'react'
import { Appearance, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Anchor, H3, Paragraph, View, Button, XStack, Form, Input, YStack, Image} from 'tamagui'
import { Moon, Sun } from '@tamagui/lucide-icons';
import { UserContext, PrimaryButton, AuthInput } from 'components'

export default function AuthScreen(props) {
  const router = useRouter();
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark';
  const { checkUserExists, login, signup, loading } = useContext(UserContext);
  
  //Possible auth steps
  type AuthStep = 'initial' | 'login' | 'signup' | null;

  // state for current state
  const [authStep, setAuthStep] = useState<AuthStep>('initial'); // 'login' or 'signup'
  // state for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // confirm password for signup
  const [confirmPassword, setConfrimPassword] = useState('');
  // state for error messages
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!username) {
      setError('Please enter a username.');
      return;
    }
    try {
      const exists = await checkUserExists(username);
      if(exists) {
        setAuthStep('login');
      } else {
        setAuthStep('signup');
      };
    } catch (e) {
      setError(e.message || 'Failed to connect to server.');
    } 
  };

  const handleLogin = async (username, password) => {
    if (!username || !password) {
      setError('Please your username and password.');
      return;
    }
    try {
      await login(username, password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e.message || 'Username or password is incorrect.');
    }
  };

  // TODO: Add secure password criteria and email validation
  const handleSignup = async (username, password, confirmPassword) => {
    if (!username || !password || !confirmPassword) {
      if (!username) {
        setError('Please enter a username.');
      } else if (!password) {
        setError('Please enter a password.');
      } else if (password !== confirmPassword) {
        setError('Passwords do not match.');
      }
      return;
    try {
      await signup(username, password);
      router.replace('/(tabs)');
    } catch (error) {
      setError(error.message || 'Failed to sign up. Please try again.');
    }
  };
}

  return (
    <YStack 
    flex={1} 
    bg="$background" 
    p="$4"
    justify="center"
    items={"center"}
    gap="$16"
    width={"100%"}>
      
      {/* Top Section */}
      <YStack items="center" pt="$8" gap='$4' width="100%">
        <Image 
          source={isDark ? (require("../assets/images/chinmaya_logo_dark.svg")) : (require("../assets/images/chinmaya_logo_light.svg"))}
          style={{ width: 80, height: 80 }}
        />
        <H3 fontWeight="$4" color="white">
          Log In or Sign Up
        </H3>
      </YStack>
      {error && <Paragraph color="red">{error}</Paragraph>}
      <Form
        items="center"
        
        width="25%"
        gap="$2"
        onSubmit={() => {
          if (authStep === "login") {
            handleLogin(username, password);
          } else if (authStep === "signup") {
            handleSignup(username, password, confirmPassword);
          } else {
            handleContinue();
          }
        }}
        p="$8"
        mb="$8"
      >
        <AuthInput 
          placeholder="Email" 
          onChangeText={setUsername}
          value={username}
          width = "100%"
          />
          <Form.Trigger asChild>
            <PrimaryButton 
              width={'100%'} 
              disabled={loading || (authStep !== 'initial' && !password)} >
              {loading ? 'Please wait...' : authStep === 'login' ? 'Log In' : authStep === 'signup' ? 'Sign Up' : 'Continue'}
            </PrimaryButton>
          </Form.Trigger>
        {authStep === 'login' && (
          <XStack gap="$4" width="100%">
          <AuthInput 
            placeholder="Password" 
            onChangeText={setPassword} 
            value={password}
            secureTextEntry />
          </XStack>
          )}
        {authStep === 'signup' && (
          <XStack gap="$4" width="100%">
            <AuthInput 
              placeholder="Password" 
              onChangeText={setPassword} 
              value={password}
              secureTextEntry 
            />
            <AuthInput 
              placeholder="Confirm password" 
              onChangeText={setConfrimPassword}  
              value={confirmPassword}
              secureTextEntry 
            />
          </XStack>
          )}
      </Form>
    </YStack>
  );
}
