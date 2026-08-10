import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getTasksRequest } from '../api/taskApi';
import { Task, TaskStatus, TaskPriority } from '../types/task.types';
import { colors, spacing, typography, radius } from '../theme';

interface TaskListScreenProps {
  onAddTask: () => void;
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
  canCreateTask: boolean;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: colors.statusPending,
  ASSIGNED: colors.statusAssigned,
  ACCEPTED: colors.statusAccepted,
  IN_PROGRESS: colors.statusInProgress,
  ON_HOLD: colors.statusOnHold,
  COMPLETED: colors.statusCompleted,
  CANCELLED: colors.statusCancelled,
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: colors.textMuted,
  MEDIUM: colors.info,
  HIGH: colors.warning,
  URGENT: colors.danger,
};

export default function TaskListScreen({
  onAddTask,
  onBack,
  onOpenTask,
  canCreateTask,
}: TaskListScreenProps) {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasksRequest,
  });

  const tasks = data?.data.tasks ?? [];

  function renderItem({ item }: { item: Task }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => onOpenTask(item.id)}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
        </View>
        <Text style={styles.customerName}>{item.customer.name}</Text>
        <Text style={styles.address} numberOfLines={1}>
          {item.customer.address}
        </Text>
        <View style={styles.footer}>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
          </View>
          {item.assignedTo && (
            <Text style={styles.assignee}>
              {item.assignedTo.firstName} {item.assignedTo.lastName}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load tasks</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No tasks yet</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
        />
      )}

      {canCreateTask && (
        <TouchableOpacity style={styles.fab} onPress={onAddTask}>
          <Text style={styles.fabText}>+ New Task</Text>
        </TouchableOpacity>
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
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  errorText: { ...typography.body, color: colors.danger, marginBottom: spacing.md },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  retryText: { ...typography.bodyBold, color: colors.textInverse },
  emptyText: { ...typography.h3, color: colors.textSecondary },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: { ...typography.bodyBold, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  customerName: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
  address: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusText: { ...typography.small, color: colors.white, fontWeight: '700' },
  assignee: { ...typography.caption, color: colors.textSecondary },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  fabText: { ...typography.bodyBold, color: colors.textInverse },
});