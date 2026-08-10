import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../store/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EmployeeListScreen from '../screens/EmployeeListScreen';
import CreateEmployeeScreen from '../screens/CreateEmployeeScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

function AuthFlow() {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />;
}

type MainScreen = 'dashboard' | 'employeeList' | 'createEmployee';

function MainFlow() {
  const [screen, setScreen] = useState<MainScreen>('dashboard');

  if (screen === 'employeeList') {
    return (
      <EmployeeListScreen
        onBack={() => setScreen('dashboard')}
        onAddEmployee={() => setScreen('createEmployee')}
      />
    );
  }

  if (screen === 'createEmployee') {
    return (
      <CreateEmployeeScreen
        onBack={() => setScreen('employeeList')}
        onSuccess={() => setScreen('employeeList')}
      />
    );
  }

  return <DashboardScreen onNavigateToEmployees={() => setScreen('employeeList')} />;
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainFlow} />
        ) : (
          <Stack.Screen name="Auth" component={AuthFlow} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});