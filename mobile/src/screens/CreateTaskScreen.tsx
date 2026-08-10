import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTaskSchema, CreateTaskFormData } from '../utils/validation';
import { createTaskRequest } from '../api/taskApi';
import { getCustomersRequest } from '../api/customerApi';
import { getEmployeesRequest } from '../api/employeeApi';
import { TaskPriority } from '../types/task.types';
import { colors, spacing, typography, radius } from '../theme';

interface CreateTaskScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function CreateTaskScreen({ onBack, onSuccess }: CreateTaskScreenProps) {
  const queryClient = useQueryClient();

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomersRequest,
  });
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployeesRequest,
  });

  const customers = customersData?.data.customers ?? [];
  const employees = employeesData?.data.employees ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      customerId: '',
      assignedToId: undefined,
      priority: 'MEDIUM',
    },
  });

  const mutation = useMutation({
    mutationFn: createTaskRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      Alert.alert('Success', 'Task created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create task';
      Alert.alert('Error', message);
    },
  });

  function onSubmit(data: CreateTaskFormData) {
    mutation.mutate(data);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Task</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Task Title</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Fix AC unit"
                placeholderTextColor={colors.textMuted}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

          <Text style={styles.label}>Description (optional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.label}>Customer</Text>
          <Controller
            control={control}
            name="customerId"
            render={({ field: { onChange, value } }) => (
              <View>
                {customers.length === 0 ? (
                  <Text style={styles.emptyHint}>No customers yet — add one first</Text>
                ) : (
                  customers.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.pickerOption, value === c.id && styles.pickerOptionActive]}
                      onPress={() => onChange(c.id)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          value === c.id && styles.pickerOptionTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                      <Text
                        style={[
                          styles.pickerOptionSubtext,
                          value === c.id && styles.pickerOptionTextActive,
                        ]}
                      >
                        {c.address}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          />
          {errors.customerId && <Text style={styles.errorText}>{errors.customerId.message}</Text>}

          <Text style={styles.label}>Assign To (optional)</Text>
          <Controller
            control={control}
            name="assignedToId"
            render={({ field: { onChange, value } }) => (
              <View>
                {employees.map((e) => (
                  <TouchableOpacity
                    key={e.id}
                    style={[styles.pickerOption, value === e.id && styles.pickerOptionActive]}
                    onPress={() => onChange(value === e.id ? undefined : e.id)}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        value === e.id && styles.pickerOptionTextActive,
                      ]}
                    >
                      {e.firstName} {e.lastName} ({e.role})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <Text style={styles.label}>Priority</Text>
          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityOption, value === p && styles.priorityOptionActive]}
                    onPress={() => onChange(p)}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        value === p && styles.priorityOptionTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.button, mutation.isPending && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Create Task</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
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
  scrollContent: { padding: spacing.lg },
  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  textArea: { textAlignVertical: 'top', minHeight: 70 },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  emptyHint: { ...typography.caption, color: colors.textMuted, fontStyle: 'italic' },
  pickerOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  pickerOptionActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  pickerOptionText: { ...typography.bodyBold, color: colors.textPrimary },
  pickerOptionSubtext: { ...typography.caption, color: colors.textSecondary },
  pickerOptionTextActive: { color: colors.primaryDark },
  priorityRow: { flexDirection: 'row', gap: spacing.xs },
  priorityOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  priorityOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  priorityOptionText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  priorityOptionTextActive: { color: colors.textInverse },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...typography.bodyBold, color: colors.textInverse },
});