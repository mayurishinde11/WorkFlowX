import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../store/AuthContext';
import { colors, spacing, typography, radius } from '../theme';

interface DashboardScreenProps {
  onNavigateToEmployees: () => void;
  onNavigateToCustomers: () => void;
  onNavigateToTasks: () => void;
}

export default function DashboardScreen({
  onNavigateToEmployees,
  onNavigateToCustomers,
  onNavigateToTasks,
}: DashboardScreenProps) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Welcome, {user?.firstName} 👋</Text>
        <Text style={styles.role}>Role: {user?.role}</Text>

        <TouchableOpacity style={styles.menuCard} onPress={onNavigateToEmployees}>
          <Text style={styles.menuCardTitle}>👥 Employees</Text>
          <Text style={styles.menuCardSubtitle}>Manage your team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={onNavigateToCustomers}>
          <Text style={styles.menuCardTitle}>🏢 Customers</Text>
          <Text style={styles.menuCardSubtitle}>Manage your customers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={onNavigateToTasks}>
          <Text style={styles.menuCardTitle}>📋 Tasks</Text>
          <Text style={styles.menuCardSubtitle}>View and manage tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  greeting: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  role: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  menuCardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  menuCardSubtitle: { ...typography.caption, color: colors.textSecondary },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButtonText: { ...typography.bodyBold, color: colors.textInverse },
});