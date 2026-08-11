import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInRequest, checkOutRequest, getMyAttendanceRequest } from '../api/attendanceApi';
import { useLocation } from '../hooks/useLocation';
import { AttendanceRecord } from '../types/attendance.types';
import { colors, spacing, typography, radius } from '../theme';

interface AttendanceScreenProps {
  onBack: () => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AttendanceScreen({ onBack }: AttendanceScreenProps) {
  const queryClient = useQueryClient();
  const { getCurrentLocation } = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: getMyAttendanceRequest,
  });

  const records = data?.data.attendance ?? [];
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = records.find((r) => r.date.startsWith(today));

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const coords = await getCurrentLocation();
      return checkInRequest(coords || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      Alert.alert('Checked In', 'Have a productive day!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to check in');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const coords = await getCurrentLocation();
      return checkOutRequest(coords || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      Alert.alert('Checked Out', 'See you tomorrow!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to check out');
    },
  });

  function renderItem({ item }: { item: AttendanceRecord }) {
    return (
      <View style={styles.card}>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <View style={styles.row}>
          <Text style={styles.timeLabel}>In: {formatTime(item.checkIn)}</Text>
          <Text style={styles.timeLabel}>Out: {formatTime(item.checkOut)}</Text>
          <Text style={styles.duration}>{formatDuration(item.workingMinutes)}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.actionSection}>
        {!todayRecord ? (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
          >
            {checkInMutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.actionButtonText}>Check In</Text>
            )}
          </TouchableOpacity>
        ) : !todayRecord.checkOut ? (
          <>
            <Text style={styles.statusText}>
              Checked in at {formatTime(todayRecord.checkIn)}
            </Text>
            <TouchableOpacity
              style={styles.checkOutButton}
              onPress={() => checkOutMutation.mutate()}
              disabled={checkOutMutation.isPending}
            >
              {checkOutMutation.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Check Out</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.statusText}>
            ✅ Completed today — {formatDuration(todayRecord.workingMinutes)}
          </Text>
        )}
      </View>

      <Text style={styles.historyTitle}>History</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
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
  actionSection: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusText: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  checkInButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
  },
  checkOutButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: { ...typography.bodyBold, color: colors.textInverse },
  historyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  date: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  timeLabel: { ...typography.caption, color: colors.textSecondary },
  duration: { ...typography.bodyBold, color: colors.primary },
});