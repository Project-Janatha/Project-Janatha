import React, { useState, useContext } from 'react'
import { Anchor, H2, Paragraph, View, Button, XStack, Form, Input, YStack } from 'tamagui'
import { UserContext } from 'components'

export default function AuthScreen(props) {
  const { login, signup, error, loading } = useContext(UserContext);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleUsername = ({ target }) => setUsername(target.value);
  const handlePassword = ({ target }) => setPassword(target.value);
  return (
    <YStack 
    flex={1} 
    bg="$background" 
    p="$4"
    justify="center"
    items={"center"}>
      <Form
        items="center"
        width={'75%'}
        height={'auto'}
        maxW={600}
        gap="$2"
        onSubmit={() => login(username, password)}
        borderWidth={1}
        rounded="$4"
        bg="$background"
        borderColor="$borderColor"
        p="$8"
      >
        <H2 fontWeight={'$5'}>Log In</H2>
        {error && <Paragraph color="red">{error}</Paragraph>}
        <Input placeholder="Username" />
        <Input placeholder="Password" secureTextEntry />

        <XStack gap="$4">
          <Form.Trigger asChild>
            <Button bg="orange">
              Login
            </Button>
          </Form.Trigger>
          <Button onPress={() => signup(username, password)}>
            Sign Up
          </Button>
        </XStack>
      </Form>
    </YStack>
  )
}
