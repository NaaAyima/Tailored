import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/api';
import { ArrowLeft, Check } from 'lucide-react-native';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  inseam?: number;
  neckSize?: number;
  sleeveLength?: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomerUpdateBody {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  inseam?: number;
  neckSize?: number;
  sleeveLength?: number;
}

const focusedBorderColor = '#C9A96E';
const defaultBorderColor = '#2A2A2A';

export default function CustomerEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [inseam, setInseam] = useState('');
  const [neckSize, setNeckSize] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const [populated, setPopulated] = useState(false);

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['customer-edit', id],
    queryFn: () => api.get<Customer>(`/api/customers/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (customer && !populated) {
      setName(customer.name ?? '');
      setPhone(customer.phone ?? '');
      setEmail(customer.email ?? '');
      setNotes(customer.notes ?? '');
      setChest(customer.chest != null ? String(customer.chest) : '');
      setWaist(customer.waist != null ? String(customer.waist) : '');
      setHips(customer.hips != null ? String(customer.hips) : '');
      setShoulder(customer.shoulder != null ? String(customer.shoulder) : '');
      setInseam(customer.inseam != null ? String(customer.inseam) : '');
      setNeckSize(customer.neckSize != null ? String(customer.neckSize) : '');
      setSleeveLength(customer.sleeveLength != null ? String(customer.sleeveLength) : '');
      setPopulated(true);
    }
  }, [customer, populated]);

  const mutation = useMutation({
    mutationFn: (body: CustomerUpdateBody) => api.put(`/api/customers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customer-edit', id] });
      router.back();
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setNameError(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const body: CustomerUpdateBody = {
      name: name.trim(),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(chest ? { chest: parseFloat(chest) } : {}),
      ...(waist ? { waist: parseFloat(waist) } : {}),
      ...(hips ? { hips: parseFloat(hips) } : {}),
      ...(shoulder ? { shoulder: parseFloat(shoulder) } : {}),
      ...(inseam ? { inseam: parseFloat(inseam) } : {}),
      ...(neckSize ? { neckSize: parseFloat(neckSize) } : {}),
      ...(sleeveLength ? { sleeveLength: parseFloat(sleeveLength) } : {}),
    };
    mutation.mutate(body);
  };

  const getBorder = (field: string, isError?: boolean) => ({
    borderColor: isError ? '#F44336' : focusedField === field ? focusedBorderColor : defaultBorderColor,
  });

  const measurementFields = [
    { key: 'chest', label: 'Chest (cm)', value: chest, set: setChest },
    { key: 'waist', label: 'Waist (cm)', value: waist, set: setWaist },
    { key: 'hips', label: 'Hips (cm)', value: hips, set: setHips },
    { key: 'shoulder', label: 'Shoulder (cm)', value: shoulder, set: setShoulder },
    { key: 'inseam', label: 'Inseam (cm)', value: inseam, set: setInseam },
    { key: 'neckSize', label: 'Neck Size (cm)', value: neckSize, set: setNeckSize },
    { key: 'sleeveLength', label: 'Sleeve Length (cm)', value: sleeveLength, set: setSleeveLength },
  ];

  const inputStyle = {
    backgroundColor: '#161616' as const,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'DMSans_400Regular' as const,
    fontSize: 15,
    color: '#F5F0E8' as const,
    marginBottom: 12,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }} testID="loading-indicator">
        <ActivityIndicator color="#C9A96E" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="customer-edit-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Pressable
                testID="back-button"
                onPress={() => { Haptics.selectionAsync(); router.back(); }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#161616',
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <ArrowLeft size={18} color="#F5F0E8" strokeWidth={1.5} />
              </Pressable>
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_700Bold_Italic',
                  fontSize: 26,
                  color: '#F5F0E8',
                }}
              >
                Edit Customer
              </Text>
              <Pressable
                testID="save-button"
                onPress={handleSave}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(201,169,110,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(201,169,110,0.4)',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="#C9A96E" size="small" />
                ) : (
                  <Check size={18} color="#C9A96E" strokeWidth={2} />
                )}
              </Pressable>
            </View>

            {/* Contact Info */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(50).duration(500))}
              style={{ paddingHorizontal: 24, marginBottom: 28 }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 11,
                  color: '#A89880',
                  letterSpacing: 2,
                  marginBottom: 14,
                }}
              >
                CONTACT INFO
              </Text>

              <TextInput
                testID="name-input"
                placeholder="Full Name *"
                placeholderTextColor="#A89880"
                value={name}
                onChangeText={(t) => { setName(t); if (t.trim()) setNameError(false); }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={[inputStyle, getBorder('name', nameError)]}
              />
              {nameError ? (
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#F44336', marginTop: -8, marginBottom: 12 }}>
                  Name is required
                </Text>
              ) : null}

              <TextInput
                testID="phone-input"
                placeholder="Phone (optional)"
                placeholderTextColor="#A89880"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                keyboardType="phone-pad"
                style={[inputStyle, getBorder('phone')]}
              />

              <TextInput
                testID="email-input"
                placeholder="Email (optional)"
                placeholderTextColor="#A89880"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[inputStyle, getBorder('email')]}
              />

              <TextInput
                testID="notes-input"
                placeholder="Notes (optional)"
                placeholderTextColor="#A89880"
                value={notes}
                onChangeText={setNotes}
                onFocus={() => setFocusedField('notes')}
                onBlur={() => setFocusedField(null)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[inputStyle, getBorder('notes'), { minHeight: 80 }]}
              />
            </Animated.View>

            {/* Measurements */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(100).duration(500))}
              style={{ paddingHorizontal: 24, marginBottom: 32 }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 11,
                  color: '#A89880',
                  letterSpacing: 2,
                  marginBottom: 6,
                }}
              >
                MEASUREMENTS
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 12,
                  color: '#A89880',
                  marginBottom: 16,
                }}
              >
                All optional. Enter values in centimetres.
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {measurementFields.map((field) => (
                  <View key={field.key} style={{ width: '47%' }}>
                    <Text
                      style={{
                        fontFamily: 'DMSans_500Medium',
                        fontSize: 11,
                        color: '#A89880',
                        marginBottom: 6,
                        letterSpacing: 0.5,
                      }}
                    >
                      {field.label}
                    </Text>
                    <TextInput
                      testID={`${field.key}-input`}
                      placeholder="—"
                      placeholderTextColor="#3A3A3A"
                      value={field.value}
                      onChangeText={field.set}
                      onFocus={() => setFocusedField(field.key)}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="decimal-pad"
                      style={{
                        backgroundColor: '#161616',
                        borderWidth: 1,
                        borderColor: focusedField === field.key ? focusedBorderColor : defaultBorderColor,
                        borderRadius: 10,
                        padding: 13,
                        fontFamily: 'DMSans_400Regular' as const,
                        fontSize: 15,
                        color: '#F5F0E8',
                      }}
                    />
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Save Button */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(150).duration(500))}
              style={{ paddingHorizontal: 24 }}
            >
              <Pressable
                testID="save-customer-button"
                onPress={handleSave}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  backgroundColor: '#C9A96E',
                  borderRadius: 16,
                  padding: 18,
                  alignItems: 'center',
                })}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="#0A0A0A" />
                ) : (
                  <Text
                    style={{
                      fontFamily: 'DMSans_700Bold',
                      fontSize: 15,
                      color: '#0A0A0A',
                      letterSpacing: 0.5,
                    }}
                  >
                    Save Changes
                  </Text>
                )}
              </Pressable>
              {mutation.isError ? (
                <Text
                  style={{
                    fontFamily: 'DMSans_400Regular',
                    fontSize: 13,
                    color: '#F44336',
                    textAlign: 'center',
                    marginTop: 10,
                  }}
                >
                  {mutation.error?.message ?? 'Something went wrong. Please try again.'}
                </Text>
              ) : null}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
