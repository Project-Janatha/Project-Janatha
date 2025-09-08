import React, { useContext } from 'react'
import { Anchor, H2, Paragraph, View, Button, XStack, YStack, Input } from 'tamagui'
import { UserContext } from 'components'

export default function LogInScreen(props) {
  const { login, signup } = useContext(UserContext);
  return (
    <View flex={1} bg="$background" p="$4">
      <YStack gap="$4">
        <H2 fontWeight={'$5'}>Log In</H2>
        <Input placeholder="Username" />
        <Input placeholder="Password" secureTextEntry />

        <XStack gap="$4">
          <Button bg="orange" onPress={() => login('username', 'password')}>
            Login
          </Button>
          <Button onPress={() => signup('username', 'password')}>
            Sign Up
          </Button>
        </XStack>

        {/* <Paragraph text="center">Made by</Paragraph>
        <Anchor color="$blue10" href="https://twitter.com/natebirdman" target="_blank">
          @natebirdmran,
        </Anchor>
        <Anchor
          color="$accent10"
          href="https://github.com/tamagui/tamagui"
          target="_blank"
          rel="noreferrer"
        >
          give it a ⭐️
        </Anchor> */}
      </YStack>
    </View>
  )
}
