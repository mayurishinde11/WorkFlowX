import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationsRequest,
  markAsReadRequest,
  markAllAsReadRequest,
  Notification,
} from '../api/notificationApi';
import { colors, spacing, typography, radius } from '../theme';

interface NotificationsScreenProps {
  onBack: () => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsRequest,
  });

  const markReadMutation = useMutation({
    mutationFn: markAsReadRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsReadRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function renderItem({ item }: { item: Notification }) {
    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.cardUnread]}
        onPress={() => !item.isRead && markReadMutation.mutate(item.id)}
      >
        {!item.isRead && <View style={styles.unreadDot} />}
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={() => markAllReadMutation.mutate()}
          disabled={unreadCount === 0}
        >
          <Text style={[styles.markAllText, unreadCount === 0 && styles.markAllDisabled]}>
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : notifications.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
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
  markAllText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  markAllDisabled: { color: colors.textMuted },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.h3, color: colors.textSecondary },
  list: { padding: spacing.lg },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
    marginTop: 6,
  },
  cardContent: { flex: 1 },
  title: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 2 },
  message: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  time: { ...typography.small, color: colors.textMuted },
});