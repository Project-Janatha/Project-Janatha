import React, { useState, useContext } from 'react'
import { Appearance, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Anchor, H3, Paragraph, View, Button, XStack, Form, Input, YStack, Image} from 'tamagui'
import { Moon, Sun } from '@tamagui/lucide-icons';
import { UserContext } from 'components'

export default function AuthScreen(props) {
  const router = useRouter();
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark';
  const { login, signup, error, loading } = useContext(UserContext);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleUsername = ({ target }) => setUsername(target.value);
  const handlePassword = ({ target }) => setPassword(target.value);
  const handleContinue = async () => {
    try {
      await login(username, password);
      router.replace('/(tabs)');
    } catch (e) {
      if (e.message.includes)
      console.log("Login failed:", e.message);
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
      <Form
        items="center"
        
        maxW={1200}
        gap="$2"
        onSubmit={handleContinue}
        
        p="$8"
        mb="$8"
      >
        {error && <Paragraph color="red">{error}</Paragraph>}
        <Input placeholder="Username" onChange={handleUsername}/>
        <Input placeholder="Password" onChange={handlePassword} secureTextEntry />

        <XStack gap="$4" width="100%">
          <Form.Trigger asChild>
            <Button width={'100%'}>
              Continue
            </Button>
          </Form.Trigger>
          {/* <Button onPress={() => signup(username, password)}>
            Sign Up
          </Button> */}
        </XStack>
      </Form>
    </YStack>
  )
}
