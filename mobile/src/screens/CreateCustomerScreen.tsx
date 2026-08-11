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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomerSchema, CreateCustomerFormData } from '../utils/validation';
import { createCustomerRequest } from '../api/customerApi';
import { useLocation } from '../hooks/useLocation';
import { colors, spacing, typography, radius } from '../theme';

interface CreateCustomerScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function CreateCustomerScreen({ onBack, onSuccess }: CreateCustomerScreenProps) {
  const queryClient = useQueryClient();

  const { getCurrentLocation, isLoading: isLocating } = useLocation();
  const [hasLocation, setHasLocation] = React.useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateCustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { name: '', phone: '', email: '', address: '', notes: '' },
  });

  async function handleUseLocation() {
    const coords = await getCurrentLocation();
    if (coords) {
      setValue('latitude', coords.latitude);
      setValue('longitude', coords.longitude);
      setHasLocation(true);
    }
  }

  const mutation = useMutation({
    mutationFn: createCustomerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      Alert.alert('Success', 'Customer created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create customer';
      Alert.alert('Error', message);
    },
  });

  function onSubmit(data: CreateCustomerFormData) {
    mutation.mutate(data);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Customer</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Customer Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Rajesh Kumar"
                placeholderTextColor={colors.textMuted}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

          <Text style={styles.label}>Address</Text>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="123 MG Road, Mumbai"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleUseLocation}
            disabled={isLocating}
          >
            <Text style={styles.locationButtonText}>
              {isLocating
                ? 'Getting location...'
                : hasLocation
                ? '✅ Location captured'
                : '📍 Use My Current Location'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Phone (optional)</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Text style={styles.label}>Email (optional)</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="customer@email.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          <Text style={styles.label}>Notes (optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Gate code, parking instructions, etc."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
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
              <Text style={styles.buttonText}>Create Customer</Text>
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
  textArea: {
    textAlignVertical: 'top',
    minHeight: 70,
  },errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  locationButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
    locationButtonText: { ...typography.bodyBold, color: colors.primary },
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