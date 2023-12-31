import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider } from "jotai"
import config from '../tamagui.config'
import { TamaguiProvider, Stack } from "tamagui"
import { Slot } from 'expo-router';
import Logo from "../assets/logo.svg";
let customFonts = {
  'Righteous': require('../assets/Righteous-Regular.ttf')
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(customFonts);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <TamaguiProvider config={config}>
      <Provider>
        <Stack flex={1} ai={'center'} jc={'center'} bg={'#23252c'}>
          <Logo width={50} style={{position: 'absolute', top:0}} />
          <Slot />
        </Stack>
      </Provider>
    </TamaguiProvider>
  );
}