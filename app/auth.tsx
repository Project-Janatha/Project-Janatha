import React, { useState, useContext } from 'react'
import { useRouter } from 'expo-router';
import { Anchor, H2, Paragraph, View, Button, XStack, Form, Input, YStack } from 'tamagui'
import { UserContext } from 'components'

export default function AuthScreen(props) {
  const router = useRouter();
  const { login, signup, error, loading } = useContext(UserContext);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

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
