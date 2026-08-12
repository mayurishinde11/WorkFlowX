import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../store/AuthContext';
import { getNotificationsRequest } from '../api/notificationApi';
import { colors, spacing, typography, radius } from '../theme';

interface DashboardScreenProps {
  onNavigateToEmployees: () => void;
  onNavigateToCustomers: () => void;
  onNavigateToTasks: () => void;
  onNavigateToAttendance: () => void;
  onNavigateToTeamMap: () => void;
  onNavigateToNotifications: () => void;
  isManagerOrAdmin: boolean;
}

export default function DashboardScreen({
  onNavigateToEmployees,
  onNavigateToCustomers,
  onNavigateToTasks,
  onNavigateToAttendance,
  onNavigateToTeamMap,
  onNavigateToNotifications,
  isManagerOrAdmin,
}: DashboardScreenProps) {
  const { user, logout } = useAuth();
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsRequest,
  });
  const unreadCount = notifData?.data.notifications.filter((n) => !n.isRead).length ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>Welcome, {user?.firstName} 👋</Text>
            <Text style={styles.role}>Role: {user?.role}</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} onPress={onNavigateToNotifications}>
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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

        <TouchableOpacity style={styles.menuCard} onPress={onNavigateToAttendance}>
          <Text style={styles.menuCardTitle}>🕐 Attendance</Text>
          <Text style={styles.menuCardSubtitle}>Check in and check out</Text>
        </TouchableOpacity>

        {isManagerOrAdmin && (
          <TouchableOpacity style={styles.menuCard} onPress={onNavigateToTeamMap}>
            <Text style={styles.menuCardTitle}>🗺️ Team Map</Text>
            <Text style={styles.menuCardSubtitle}>See where your team is</Text>
          </TouchableOpacity>
        )}
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 20 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  role: { ...typography.body, color: colors.textSecondary },
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