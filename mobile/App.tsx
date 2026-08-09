import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/store/AuthContext';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LoginScreen />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}