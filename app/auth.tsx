import React, { useState, useContext } from 'react'
import { Appearance, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Anchor, H3, Paragraph, View, Button, XStack, Form, Input, YStack, Image} from 'tamagui'
import { Code, Moon, Sun } from '@tamagui/lucide-icons';
import { UserContext, PrimaryButton, AuthInput } from 'components'
import { Platform } from 'react-native';

const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <Paragraph color="$red10" fontSize={12} marginTop="$1" marginLeft="$1">
      {message}
    </Paragraph>
  );
};

export default function AuthScreen(props) {
  const router = useRouter();
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark';
  const { checkUserExists, login, signup, setUser, loading } = useContext(UserContext);
  const isWeb = Platform.OS === 'web';
  
  //Possible auth steps
  type AuthStep = 'initial' | 'login' | 'signup' | null;

  // state for current state
  const [authStep, setAuthStep] = useState<AuthStep>('initial'); // 'login' or 'signup'
  // state for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // confirm password for signup
  const [confirmPassword, setConfirmPassword] = useState('');
  // state for error messages
  const [errors, setErrors] = useState<{ [Key: string]: string }>({});

  const handleContinue = async () => {
    setErrors({});
    if (!username) {
      setErrors({username: 'Please enter a username.'});
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
      setErrors({form: e.message || 'Failed to connect to server.'});
    } 
  };

  const handleLogin = async (username, password) => {
    setErrors({});
    if (!username) {
      setErrors({username: 'Please enter a username.'});
      return;
    }
    if (!password) {
      setErrors({password: 'Please your password.'});
      return;
    }
    try {
      await login(username, password);
      router.replace('/(tabs)');
    } catch (e) {
      setErrors({form: e.message || 'Username or password is incorrect.'});
    }
  };

  // TODO: Add secure password criteria and email validation
  const handleSignup = async (username, password, confirmPassword) => {
    setErrors({});
    if (!username) {
      setErrors({ username: 'Please enter a username.'});
      return;
    }
    if (!password) {
      setErrors({password: 'Please enter a password.'});
      return;
    }
    if (password !== confirmPassword) {
      setErrors({confirmPassword: 'Passwords do not match.'});
      return;
    }
    try {
      await signup(username, password);
      router.replace('/onboarding/welcome');
    } catch (e) {
      setErrors({ form: e.message || 'Failed to sign up. Please try again.'});
    }
  };

  return (
    <YStack 
      flex={1} 
      backgroundColor="$background" 
      padding={isWeb ? "$6" : "$2"}
      justifyContent="space-between"
      alignItems={"center"}
      width={"100%"}
      minHeight="100vh"
      maxWidth="100vw"
      className="auth-container">
      
      {/* Top Section */}
      <YStack alignItems="center" paddingTop={isWeb ? "$8" : "$6"} gap='$4' width="100%" flex={1} justifyContent="center">
        <Image 
          source={isDark ? (require("../assets/images/chinmaya_logo_dark.svg")) : (require("../assets/images/chinmaya_logo_light.svg"))}
          style={{ width: isWeb ? 80 : 60, height: isWeb ? 80 : 60 }}
        />
        <H3 fontWeight="$4" color="$color" textAlign="center">
          Log In or Sign Up
        </H3>
      </YStack>
      
      {/* Form Section */}
      <YStack width="100%" alignItems="center" flex={1} justifyContent="center" paddingBottom={isWeb ? "$8" : "$6"} paddingHorizontal="$4">
        <Form
          alignItems="center"
          width="100%"
          maxWidth={isWeb ? 400 : 320}
          minWidth={280}
          gap="$3"
          className="auth-form"
          style={{
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
          onSubmit={() => {
            if (authStep === "login") {
              handleLogin(username, password);
            } else if (authStep === "signup") {
              handleSignup(username, password, confirmPassword);
            } else {
              handleContinue();
            }
          }}
          padding={isWeb ? "$6" : "$3"}
        >
        <FieldError message={errors.form} />
        <AuthInput 
          placeholder="Email" 
          onChangeText={setUsername}
          value={username}
          width = "100%"
          />
        <FieldError message={errors.username} />
        {authStep === 'login' && (
          <YStack gap="$2" width="100%">
            <AuthInput 
              placeholder="Password" 
              onChangeText={setPassword} 
              value={password}
              width={"100%"}
              secureTextEntry />
            <FieldError message={errors.password} />
          </YStack>
          )}
          
        {authStep === 'signup' && (
          <YStack gap="$2" width="100%">
            <AuthInput 
              placeholder="Password" 
              onChangeText={setPassword} 
              value={password}
              width={"100%"}
              secureTextEntry 
            />
            <FieldError message={errors.password}/>
            <AuthInput 
              placeholder="Confirm password" 
              onChangeText={setConfirmPassword}  
              value={confirmPassword}
              width={"100%"}
              secureTextEntry 
            />
            <FieldError message={errors.confirmPassword} />
          </YStack>
          )}
          <Form.Trigger asChild>
            <PrimaryButton 
              width={'100%'} 
              disabled={loading || (authStep === 'initial' && !username) // disable if loading or username empty
                || (authStep !== 'initial' && !password) // disable if loading or password empty for login/signup
                || (authStep === 'signup' && !confirmPassword)}  // disable if loading or confirm password empty for signup
            >
              {loading ? 'Please wait...' : authStep === 'login' ? 'Log In' : authStep === 'signup' ? 'Sign Up' : 'Continue'}
            </PrimaryButton>
          </Form.Trigger>
        </Form>
        
        {/* Dev Mode Button - only show on web */}
        {isWeb && (
          <Button 
            icon={<Code color="$color" />} 
            marginTop="$4"
            onPress={() => {
              const devUser = {
                username: 'dev_user',
                id: 'dev_id',
                center: -1,
                points: 999,
                isVerified: true,
                verificationLevel: 99,
                exists: true,
                isActive: true,
                events: [],
              };
              // Set the mock user in the context
              setUser(devUser);
              // Navigate to the main screen
              router.push('/(tabs)');
            }}
          >
            Dev Mode
          </Button>
        )}
      </YStack>
    </YStack>
  );
}
