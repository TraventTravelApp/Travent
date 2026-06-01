import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as Sentry from '@sentry/react-native';
import AppNavigator from './src/navigation/AppNavigator';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  debug: __DEV__,
  sendDefaultPii: false,
  tracesSampleRate: 0.0,
});

function App() {
  const [fontsLoaded] = useFonts({
    'Junge-Regular': require('./assets/fonts/Junge-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#F4EBDC" />
      <AppNavigator />
    </>
  );
}

export default Sentry.wrap(App);
