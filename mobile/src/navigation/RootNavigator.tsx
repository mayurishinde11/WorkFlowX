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
import CustomerListScreen from '../screens/CustomerListScreen';
import CreateCustomerScreen from '../screens/CreateCustomerScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

function AuthFlow() {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />;
}

type MainScreen =
  | 'dashboard'
  | 'employeeList'
  | 'createEmployee'
  | 'customerList'
  | 'createCustomer';

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

  if (screen === 'customerList') {
    return (
      <CustomerListScreen
        onBack={() => setScreen('dashboard')}
        onAddCustomer={() => setScreen('createCustomer')}
      />
    );
  }

  if (screen === 'createCustomer') {
    return (
      <CreateCustomerScreen
        onBack={() => setScreen('customerList')}
        onSuccess={() => setScreen('customerList')}
      />
    );
  }

  return (
    <DashboardScreen
      onNavigateToEmployees={() => setScreen('employeeList')}
      onNavigateToCustomers={() => setScreen('customerList')}
    />
  );
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