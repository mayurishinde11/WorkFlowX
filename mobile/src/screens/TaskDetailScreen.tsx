import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskByIdRequest, updateTaskStatusRequest } from '../api/taskApi';
import LocationMap from '../components/LocationMap';
import { useAuth } from '../store/AuthContext';
import { TaskStatus } from '../types/task.types';
import { colors, spacing, typography, radius } from '../theme';

interface TaskDetailScreenProps {
  taskId: string;
  onBack: () => void;
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

const NEXT_ACTION: Partial<Record<TaskStatus, { label: string; next: TaskStatus }>> = {
  ASSIGNED: { label: 'Accept Task', next: 'ACCEPTED' },
  ACCEPTED: { label: 'Start Task', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'Complete Task', next: 'COMPLETED' },
  ON_HOLD: { label: 'Resume Task', next: 'IN_PROGRESS' },
};

export default function TaskDetailScreen({ taskId, onBack }: TaskDetailScreenProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskByIdRequest(taskId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: TaskStatus; notes?: string }) =>
      updateTaskStatusRequest(taskId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update task';
      Alert.alert('Error', message);
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data?.data.task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load task</Text>
        </View>
      </SafeAreaView>
    );
  }

  const task = data.data.task;
  const nextAction = NEXT_ACTION[task.status];
  const isMyTask = task.assignedTo?.id === user?.id;
  const canUpdateStatus = user?.role !== 'EMPLOYEE' || isMyTask;

  function handleStatusChange(newStatus: TaskStatus) {
    statusMutation.mutate({ status: newStatus });
  }

  function handleHold() {
    Alert.alert('Put on hold?', 'This will pause the task.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => handleStatusChange('ON_HOLD') },
    ]);
  }

  function handleCancel() {
    Alert.alert('Cancel task?', 'This action cannot be undone.', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, cancel', style: 'destructive', onPress: () => handleStatusChange('CANCELLED') },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Task Details
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[task.status] }]}>
          <Text style={styles.statusBadgeText}>{task.status.replace('_', ' ')}</Text>
        </View>

        <Text style={styles.title}>{task.title}</Text>
        {task.description && <Text style={styles.description}>{task.description}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Customer</Text>
          <Text style={styles.sectionValue}>{task.customer.name}</Text>
          <Text style={styles.sectionSubvalue}>{task.customer.address}</Text>
          {task.customer.phone && (
            <Text style={styles.sectionSubvalue}>📞 {task.customer.phone}</Text>
          )}
        </View>

        {task.customer.latitude != null && task.customer.longitude != null && (
          <View style={styles.mapContainer}>
            <LocationMap
              latitude={task.customer.latitude}
              longitude={task.customer.longitude}
              title={task.customer.name}
            />
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Assigned To</Text>
          <Text style={styles.sectionValue}>
            {task.assignedTo
              ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
              : 'Unassigned'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Priority</Text>
          <Text style={styles.sectionValue}>{task.priority}</Text>
        </View>

        {task.statusHistory && task.statusHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>History</Text>
            {task.statusHistory.map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={[styles.historyDot, { backgroundColor: STATUS_COLORS[entry.status] }]} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyStatus}>{entry.status.replace('_', ' ')}</Text>
                  <Text style={styles.historyMeta}>
                    {entry.changedBy.firstName} {entry.changedBy.lastName} •{' '}
                    {new Date(entry.createdAt).toLocaleString()}
                  </Text>
                  {entry.notes && <Text style={styles.historyNotes}>{entry.notes}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {canUpdateStatus && (nextAction || task.status === 'IN_PROGRESS') && (
        <View style={styles.actionBar}>
          {nextAction && (
            <TouchableOpacity
              style={[styles.primaryButton, statusMutation.isPending && styles.buttonDisabled]}
              onPress={() => handleStatusChange(nextAction.next)}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>{nextAction.label}</Text>
              )}
            </TouchableOpacity>
          )}
          {task.status === 'IN_PROGRESS' && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleHold}>
              <Text style={styles.secondaryButtonText}>Put on Hold</Text>
            </TouchableOpacity>
          )}
          {!['COMPLETED', 'CANCELLED'].includes(task.status) && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel Task</Text>
            </TouchableOpacity>
          )}
        </View>
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
  headerTitle: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...typography.body, color: colors.danger },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl * 3 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  statusBadgeText: { ...typography.caption, color: colors.white, fontWeight: '700' },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  mapContainer: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: '100%',
    height: 200,
  },

  sectionLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  sectionValue: { ...typography.bodyBold, color: colors.textPrimary },
  sectionSubvalue: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  historyItem: { flexDirection: 'row', marginTop: spacing.sm },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: spacing.sm },
  historyContent: { flex: 1 },
  historyStatus: { ...typography.bodyBold, color: colors.textPrimary },
  historyMeta: { ...typography.small, color: colors.textMuted },
  historyNotes: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { ...typography.bodyBold, color: colors.textInverse },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  secondaryButtonText: { ...typography.bodyBold, color: colors.warning },
  cancelButton: { alignItems: 'center', paddingVertical: spacing.xs },
  cancelButtonText: { ...typography.caption, color: colors.danger },
});