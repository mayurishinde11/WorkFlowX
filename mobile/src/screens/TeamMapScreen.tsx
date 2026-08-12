import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getActiveEmployeeLocationsRequest } from '../api/locationApi';
import TeamLocationMap from '../components/TeamLocationMap';
import { colors, spacing, typography } from '../theme';

interface TeamMapScreenProps {
  onBack: () => void;
}

export default function TeamMapScreen({ onBack }: TeamMapScreenProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['team-locations'],
    queryFn: getActiveEmployeeLocationsRequest,
  });

  const locations = data?.data.locations ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Map</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.refreshButton}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load team locations</Text>
        </View>
      ) : locations.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No location data yet</Text>
          <Text style={styles.emptySubtext}>
            Employee locations appear here once they check in
          </Text>
        </View>
      ) : (
        <View style={styles.mapWrapper}>
          <TeamLocationMap locations={locations} height={500} />
          <Text style={styles.countText}>
            {locations.length} employee{locations.length !== 1 ? 's' : ''} tracked
          </Text>
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
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  refreshButton: { ...typography.body, color: colors.primary },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  errorText: { ...typography.body, color: colors.danger },
  emptyText: { ...typography.h3, color: colors.textSecondary, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  mapWrapper: { flex: 1, padding: spacing.lg },
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});