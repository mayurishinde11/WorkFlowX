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
import { getCustomersRequest } from '../api/customerApi';
import { Customer } from '../types/customer.types';
import { colors, spacing, typography, radius } from '../theme';

interface CustomerListScreenProps {
  onAddCustomer: () => void;
  onBack: () => void;
}

export default function CustomerListScreen({ onAddCustomer, onBack }: CustomerListScreenProps) {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomersRequest,
  });

  const customers = data?.data.customers ?? [];

  function renderItem({ item }: { item: Customer }) {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        {item.phone && <Text style={styles.phone}>📞 {item.phone}</Text>}
        {item.notes && <Text style={styles.notes}>📝 {item.notes}</Text>}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Customers</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load customers</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : customers.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No customers yet</Text>
          <Text style={styles.emptySubtext}>Tap the button below to add your first customer</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddCustomer}>
        <Text style={styles.fabText}>+ Add Customer</Text>
      </TouchableOpacity>
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
  title: { ...typography.h3, color: colors.textPrimary },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  errorText: { ...typography.body, color: colors.danger, marginBottom: spacing.md },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  retryText: { ...typography.bodyBold, color: colors.textInverse },
  emptyText: { ...typography.h3, color: colors.textSecondary, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.xs },
  address: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  phone: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  notes: { ...typography.caption, color: colors.textMuted },
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