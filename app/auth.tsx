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
  // state for error messages
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');
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
        onSubmit={handleContinue}
        
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

        
          
          {/* <Button onPress={() => signup(username, password)}>
            Sign Up
          </Button> */}
      </Form>
    </YStack>
  )
}
