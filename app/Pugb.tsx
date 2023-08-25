import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Logo from "./assets/logo.svg"
import { Stack, Button, TamaguiProvider } from 'tamagui';

export default function Pugb() {
  return (
    <Stack bg={'#23252c'} flex={1} jc={'center'} ai={'center'}>
      <Logo width={100} />
      <Button bg={'#5462eb'}>Login</Button>
    </Stack>
  )
}