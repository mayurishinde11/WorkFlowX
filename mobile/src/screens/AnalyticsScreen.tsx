import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getDashboardStatsRequest } from '../api/analyticsApi';
import { colors, spacing, typography, radius } from '../theme';

interface AnalyticsScreenProps {
  onBack: () => void;
}

const screenWidth = Dimensions.get('window').width;

const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.statusPending,
  ASSIGNED: colors.statusAssigned,
  ACCEPTED: colors.statusAccepted,
  IN_PROGRESS: colors.statusInProgress,
  ON_HOLD: colors.statusOnHold,
  COMPLETED: colors.statusCompleted,
  CANCELLED: colors.statusCancelled,
};

export default function AnalyticsScreen({ onBack }: AnalyticsScreenProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStatsRequest,
  });

  const stats = data?.data;

  const pieData =
    stats?.tasksByStatus.map((item) => ({
      name: item.status.replace('_', ' '),
      population: item.count,
      color: STATUS_COLORS[item.status] || colors.textMuted,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    })) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError || !stats ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load analytics</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalEmployees}</Text>
              <Text style={styles.statLabel}>Total Employees</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeEmployees}</Text>
              <Text style={styles.statLabel}>Active Employees</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeTasks}</Text>
              <Text style={styles.statLabel}>Active Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pendingTasks}</Text>
              <Text style={styles.statLabel}>Pending Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.completedToday}</Text>
              <Text style={styles.statLabel}>Completed Today</Text>
            </View>
            <View style={[styles.statCard, stats.overdueTasks > 0 && styles.statCardAlert]}>
              <Text style={[styles.statValue, stats.overdueTasks > 0 && styles.statValueAlert]}>
                {stats.overdueTasks}
              </Text>
              <Text style={styles.statLabel}>Overdue Tasks</Text>
            </View>
          </View>

          <View style={styles.completionCard}>
            <Text style={styles.completionLabel}>Completion Rate</Text>
            <Text style={styles.completionValue}>{stats.completionRate}%</Text>
          </View>

          {pieData.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Tasks by Status</Text>
              <PieChart
                data={pieData}
                width={screenWidth - spacing.lg * 2}
                height={200}
                chartConfig={{
                  color: () => colors.textPrimary,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
              />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: { ...typography.body, color: colors.primary },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...typography.body, color: colors.danger },
  scrollContent: { padding: spacing.lg },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statCardAlert: { borderColor: colors.danger, backgroundColor: '#FEF2F2' },
  statValue: { ...typography.h1, color: colors.textPrimary },
  statValueAlert: { color: colors.danger },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  completionCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  completionLabel: { ...typography.body, color: colors.textInverse, opacity: 0.9 },
  completionValue: { ...typography.h1, color: colors.textInverse, fontSize: 40 },
  chartSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
});