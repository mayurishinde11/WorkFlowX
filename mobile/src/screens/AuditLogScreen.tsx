import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogsRequest, AuditLog } from '../api/auditLogApi';
import { colors, spacing, typography, radius } from '../theme';

interface AuditLogScreenProps {
  onBack: () => void;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: colors.success,
  UPDATE: colors.info,
  DELETE: colors.danger,
  CANCEL: colors.danger,
  DEACTIVATE: colors.warning,
};

function formatMetadata(metadata: string | null): string {
  if (!metadata) return '';
  try {
    const parsed = JSON.parse(metadata);
    return Object.entries(parsed)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  } catch {
    return metadata;
  }
}

export default function AuditLogScreen({ onBack }: AuditLogScreenProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: getAuditLogsRequest,
  });

  const logs = data?.data.logs ?? [];

  function renderItem({ item }: { item: AuditLog }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.actionBadge,
              { backgroundColor: ACTION_COLORS[item.action] || colors.textMuted },
            ]}
          >
            <Text style={styles.actionText}>{item.action}</Text>
          </View>
          <Text style={styles.entityText}>{item.entity}</Text>
        </View>
        {item.metadata && (
          <Text style={styles.metadataText} numberOfLines={2}>
            {formatMetadata(item.metadata)}
          </Text>
        )}
        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Log</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load audit logs</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No activity recorded yet</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
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
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { ...typography.body, color: colors.danger },
  emptyText: { ...typography.h3, color: colors.textSecondary },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  actionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  actionText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  entityText: { ...typography.bodyBold, color: colors.textPrimary },
  metadataText: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  timeText: { ...typography.small, color: colors.textMuted },
});