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
import TaskListScreen from '../screens/TaskListScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TeamMapScreen from '../screens/TeamMapScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
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
  | 'createCustomer'
  | 'taskList'
  | 'createTask'
  | 'taskDetail'
  | 'attendance'
  | 'teamMap'
  | 'notifications';

function MainFlow() {
  const { user } = useAuth();
  const [screen, setScreen] = useState<MainScreen>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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

  if (screen === 'taskList') {
    return (
      <TaskListScreen
        onBack={() => setScreen('dashboard')}
        onAddTask={() => setScreen('createTask')}
        onOpenTask={(taskId) => {
          setSelectedTaskId(taskId);
          setScreen('taskDetail');
        }}
        canCreateTask={user?.role !== 'EMPLOYEE'}
      />
    );
  }

  if (screen === 'createTask') {
    return (
      <CreateTaskScreen
        onBack={() => setScreen('taskList')}
        onSuccess={() => setScreen('taskList')}
      />
    );
  }

  if (screen === 'taskDetail' && selectedTaskId) {
    return (
      <TaskDetailScreen taskId={selectedTaskId} onBack={() => setScreen('taskList')} />
    );
  }

  if (screen === 'attendance') {
    return <AttendanceScreen onBack={() => setScreen('dashboard')} />;
  }

  if (screen === 'teamMap') {
    return <TeamMapScreen onBack={() => setScreen('dashboard')} />;
  }

  if (screen === 'notifications') {
    return <NotificationsScreen onBack={() => setScreen('dashboard')} />;
  }

  return (
    <DashboardScreen
      onNavigateToEmployees={() => setScreen('employeeList')}
      onNavigateToCustomers={() => setScreen('customerList')}
      onNavigateToTasks={() => setScreen('taskList')}
      onNavigateToAttendance={() => setScreen('attendance')}
      onNavigateToTeamMap={() => setScreen('teamMap')}
      onNavigateToNotifications={() => setScreen('notifications')}
      isManagerOrAdmin={user?.role !== 'EMPLOYEE'}
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