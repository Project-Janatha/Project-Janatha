import React, { useState, useContext } from 'react'
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Anchor, H2, Paragraph, View, Button, XStack, Form, Input, YStack, Image} from 'tamagui'
import { Moon, Sun } from '@tamagui/lucide-icons';
import { UserContext } from 'components'

export default function AuthScreen(props) {
  const router = useRouter();
  const colorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(colorScheme === 'dark')
  const { login, signup, error, loading } = useContext(UserContext);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const toggleTheme = () => {
    setIsDark(!isDark)
    // Update system theme preference
    if (window?.localStorage) {
      window.localStorage.setItem('theme', !isDark ? 'dark' : 'light')
    }
  }
  const handleUsername = ({ target }) => setUsername(target.value);
  const handlePassword = ({ target }) => setPassword(target.value);
  const handleLogin = async () => {
    try {
      await login(username, password);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <YStack 
    flex={1} 
    bg="$background" 
    p="$4"
    justify="center"
    items={"center"}>
      <Button 
      position='absolute'
      t='$4'
      r='$4'
      size="$2.5"
      onPress={toggleTheme}
      icon={isDark ? <Sun size={20} /> : <Moon size={20} />}
      theme={isDark ? 'yellow' : 'blue'}
      />
      {/* Top Section */}
      <YStack items="center" pt="$8">
        {isDark ? (
          <Image source={require("../assets/images/chinmaya_logo_dark.svg")}/>
          ) : (
          <Image source={require("../assets/images/chinmaya_logo_light.svg")}/>
          )}
        <Paragraph color="#888">
          Log in to continue
        </Paragraph>
      </YStack>
      <Form
        items="center"
        width={'auto'}
        height={'auto'}
        maxW={600}
        gap="$2"
        onSubmit={handleLogin}
        borderWidth={1}
        rounded="$4"
        bg="$background"
        borderColor="$borderColor"
        p="$8"
      >
        <H2 fontWeight={'$5'}>Log In</H2>
        {error && <Paragraph color="red">{error}</Paragraph>}
        <Input placeholder="Username" onChange={handleUsername}/>
        <Input placeholder="Password" onChange={handlePassword} secureTextEntry />

        <XStack gap="$4" width="100%">
          <Form.Trigger asChild>
            <Button bg="orange" width={'100%'}>
              Login
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
