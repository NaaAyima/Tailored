import React, { useState } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/api';
import { ArrowLeft, Check } from 'lucide-react-native';

interface GarmentCreateBody {
  type: string;
  description?: string;
  status: string;
}

interface CustomerGarment {
  id: string;
  customerId: string;
  type: string;
  description?: string;
  status: string;
  createdAt: string;
}

const GARMENT_TYPES = [
  { key: 'blouse', label: 'Blouse', emoji: '👚' },
  { key: 'pants', label: 'Pants', emoji: '👖' },
  { key: 'dress', label: 'Dress', emoji: '👗' },
  { key: 'shirt', label: 'Shirt', emoji: '👔' },
  { key: 'skirt', label: 'Skirt', emoji: '🩳' },
  { key: 'suit', label: 'Suit', emoji: '🤵' },
  { key: 'other', label: 'Other', emoji: '🧵' },
];

const STATUSES = [
  { key: 'pending', label: 'Pending', color: '#FF9800' },
  { key: 'in_progress', label: 'In Progress', color: '#2196F3' },
  { key: 'completed', label: 'Completed', color: '#4CAF50' },
];

export default function CustomerAddGarmentScreen() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<string>('blouse');
  const [description, setDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [typeError, setTypeError] = useState(false);

  const mutation = useMutation({
    mutationFn: (body: GarmentCreateBody) =>
      api.post<CustomerGarment>(`/api/customers/${customerId}/garments`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.back();
    },
  });

  const handleSave = () => {
    if (!selectedType) {
      setTypeError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setTypeError(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const body: GarmentCreateBody = {
      type: selectedType,
      status: selectedStatus,
      ...(description.trim() ? { description: description.trim() } : {}),
    };
    mutation.mutate(body);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="add-garment-screen">
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
                Add Garment
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

            {/* Garment Type */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(50).duration(500))}
              style={{ paddingHorizontal: 24, marginBottom: 28 }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 11,
                  color: typeError ? '#F44336' : '#A89880',
                  letterSpacing: 2,
                  marginBottom: 14,
                }}
              >
                GARMENT TYPE
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {GARMENT_TYPES.map((type) => {
                  const isSelected = selectedType === type.key;
                  return (
                    <Pressable
                      key={type.key}
                      testID={`type-${type.key}`}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedType(type.key);
                        setTypeError(false);
                      }}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        borderRadius: 14,
                        backgroundColor: isSelected
                          ? 'rgba(201,169,110,0.14)'
                          : '#161616',
                        borderWidth: 1,
                        borderColor: isSelected ? '#C9A96E' : '#2A2A2A',
                      })}
                    >
                      <Text style={{ fontSize: 16 }}>{type.emoji}</Text>
                      <Text
                        style={{
                          fontFamily: isSelected ? 'DMSans_500Medium' : 'DMSans_400Regular',
                          fontSize: 14,
                          color: isSelected ? '#C9A96E' : '#A89880',
                        }}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            {/* Description */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(100).duration(500))}
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
                DESCRIPTION
              </Text>
              <TextInput
                testID="description-input"
                placeholder="Add a description... (optional)"
                placeholderTextColor="#A89880"
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{
                  backgroundColor: '#161616',
                  borderWidth: 1,
                  borderColor: focusedField === 'description' ? '#C9A96E' : '#2A2A2A',
                  borderRadius: 12,
                  padding: 14,
                  fontFamily: 'DMSans_400Regular' as const,
                  fontSize: 15,
                  color: '#F5F0E8',
                  minHeight: 80,
                }}
              />
            </Animated.View>

            {/* Status */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(150).duration(500))}
              style={{ paddingHorizontal: 24, marginBottom: 36 }}
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
                STATUS
              </Text>
              <View
                style={{
                  backgroundColor: '#161616',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  overflow: 'hidden',
                }}
              >
                {STATUSES.map((status, index) => {
                  const isSelected = selectedStatus === status.key;
                  return (
                    <Pressable
                      key={status.key}
                      testID={`status-${status.key}`}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedStatus(status.key);
                      }}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        borderBottomWidth: index < STATUSES.length - 1 ? 1 : 0,
                        borderBottomColor: '#2A2A2A',
                        backgroundColor: isSelected
                          ? `${status.color}0A`
                          : 'transparent',
                        gap: 12,
                      })}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: isSelected ? status.color : '#3A3A3A',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected ? (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: status.color,
                            }}
                          />
                        ) : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: isSelected ? 'DMSans_500Medium' : 'DMSans_400Regular',
                            fontSize: 15,
                            color: isSelected ? status.color : '#F5F0E8',
                          }}
                        >
                          {status.label}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: status.color,
                          opacity: 0.7,
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            {/* Save Button */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(200).duration(500))}
              style={{ paddingHorizontal: 24 }}
            >
              <Pressable
                testID="save-garment-button"
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
                    Add Garment
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
