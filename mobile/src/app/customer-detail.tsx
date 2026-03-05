import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/api';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react-native';

interface GarmentCounts {
  blouse: number;
  pants: number;
  dress: number;
  shirt: number;
  skirt: number;
  suit: number;
  other: number;
  total: number;
}

interface CustomerGarment {
  id: string;
  customerId: string;
  type: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface CustomerDetail {
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
  garmentCounts: GarmentCounts;
  garments: CustomerGarment[];
}

const GARMENT_LABELS: Array<{ key: keyof Omit<GarmentCounts, 'total'>; label: string; emoji: string }> = [
  { key: 'blouse', label: 'Blouse', emoji: '👚' },
  { key: 'pants', label: 'Pants', emoji: '👖' },
  { key: 'dress', label: 'Dress', emoji: '👗' },
  { key: 'shirt', label: 'Shirt', emoji: '👔' },
  { key: 'skirt', label: 'Skirt', emoji: '🩳' },
  { key: 'suit', label: 'Suit', emoji: '🤵' },
  { key: 'other', label: 'Other', emoji: '🧵' },
];

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed': return '#4CAF50';
    case 'in_progress': return '#2196F3';
    default: return '#FF9800';
  }
}

function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed': return 'Completed';
    case 'in_progress': return 'In Progress';
    default: return 'Pending';
  }
}

function getGarmentEmoji(type: string): string {
  const found = GARMENT_LABELS.find((g) => g.key === type.toLowerCase());
  return found?.emoji ?? '🧵';
}

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteGarmentId, setDeleteGarmentId] = useState<string | null>(null);

  const { data: customer, isLoading } = useQuery<CustomerDetail>({
    queryKey: ['customer', id],
    queryFn: () => api.get<CustomerDetail>(`/api/customers/${id}`),
    enabled: !!id,
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: () => api.delete(`/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.back();
    },
  });

  const deleteGarmentMutation = useMutation({
    mutationFn: (garmentId: string) =>
      api.delete(`/api/customers/${id}/garments/${garmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteGarmentId(null);
    },
  });

  const measurements = customer
    ? [
        { label: 'CHEST', value: customer.chest ? `${customer.chest} cm` : '—' },
        { label: 'WAIST', value: customer.waist ? `${customer.waist} cm` : '—' },
        { label: 'HIPS', value: customer.hips ? `${customer.hips} cm` : '—' },
        { label: 'SHOULDER', value: customer.shoulder ? `${customer.shoulder} cm` : '—' },
        { label: 'INSEAM', value: customer.inseam ? `${customer.inseam} cm` : '—' },
        { label: 'NECK', value: customer.neckSize ? `${customer.neckSize} cm` : '—' },
        { label: 'SLEEVE', value: customer.sleeveLength ? `${customer.sleeveLength} cm` : '—' },
      ]
    : [];

  if (isLoading || !customer) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }} testID="loading-indicator">
        <ActivityIndicator color="#C9A96E" size="large" />
      </View>
    );
  }

  const nonZeroGarments = GARMENT_LABELS.filter(
    (g) => (customer.garmentCounts?.[g.key] ?? 0) > 0
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="customer-detail-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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

              <Pressable
                testID="edit-customer-button"
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push(`/customer-edit?id=${id}`);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 20,
                  backgroundColor: 'rgba(201,169,110,0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(201,169,110,0.3)',
                })}
              >
                <Edit2 size={14} color="#C9A96E" strokeWidth={1.5} />
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#C9A96E' }}>
                  Edit
                </Text>
              </Pressable>
            </View>

            {/* Avatar + Name */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(50).duration(500))}
              style={{ alignItems: 'center', paddingBottom: 28, paddingHorizontal: 24 }}
            >
              <LinearGradient
                colors={['#C9A96E', '#A07840']}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'CormorantGaramond_700Bold',
                    fontSize: 34,
                    color: '#0A0A0A',
                  }}
                >
                  {customer.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_700Bold',
                  fontSize: 28,
                  color: '#F5F0E8',
                  marginBottom: 6,
                  textAlign: 'center',
                }}
              >
                {customer.name}
              </Text>
              {customer.phone ? (
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', marginBottom: 2 }}>
                  {customer.phone}
                </Text>
              ) : null}
              {customer.email ? (
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880' }}>
                  {customer.email}
                </Text>
              ) : null}
              {customer.notes ? (
                <View
                  style={{
                    marginTop: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: '#161616',
                    borderWidth: 1,
                    borderColor: '#2A2A2A',
                    maxWidth: 300,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      fontSize: 13,
                      color: '#A89880',
                      textAlign: 'center',
                      lineHeight: 20,
                    }}
                  >
                    {customer.notes}
                  </Text>
                </View>
              ) : null}
            </Animated.View>

            {/* Measurements */}
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
                  marginBottom: 12,
                }}
              >
                MEASUREMENTS
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
                {/* Row 1: Chest, Waist, Hips */}
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' }}>
                  {measurements.slice(0, 3).map((m, i) => (
                    <View
                      key={m.label}
                      style={{
                        flex: 1,
                        padding: 16,
                        alignItems: 'center',
                        borderRightWidth: i < 2 ? 1 : 0,
                        borderRightColor: '#2A2A2A',
                      }}
                    >
                      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: '#A89880', letterSpacing: 1.5, marginBottom: 5 }}>
                        {m.label}
                      </Text>
                      <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: '#F5F0E8' }}>
                        {m.value}
                      </Text>
                    </View>
                  ))}
                </View>
                {/* Row 2: Shoulder, Inseam */}
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' }}>
                  {measurements.slice(3, 5).map((m, i) => (
                    <View
                      key={m.label}
                      style={{
                        flex: 1,
                        padding: 16,
                        alignItems: 'center',
                        borderRightWidth: i < 1 ? 1 : 0,
                        borderRightColor: '#2A2A2A',
                      }}
                    >
                      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: '#A89880', letterSpacing: 1.5, marginBottom: 5 }}>
                        {m.label}
                      </Text>
                      <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: '#F5F0E8' }}>
                        {m.value}
                      </Text>
                    </View>
                  ))}
                </View>
                {/* Row 3: Neck, Sleeve */}
                <View style={{ flexDirection: 'row' }}>
                  {measurements.slice(5, 7).map((m, i) => (
                    <View
                      key={m.label}
                      style={{
                        flex: 1,
                        padding: 16,
                        alignItems: 'center',
                        borderRightWidth: i < 1 ? 1 : 0,
                        borderRightColor: '#2A2A2A',
                      }}
                    >
                      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: '#A89880', letterSpacing: 1.5, marginBottom: 5 }}>
                        {m.label}
                      </Text>
                      <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: '#F5F0E8' }}>
                        {m.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Garment Orders */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(150).duration(500))}
              style={{ paddingHorizontal: 24, marginBottom: 28 }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'DMSans_700Bold',
                    fontSize: 11,
                    color: '#A89880',
                    letterSpacing: 2,
                  }}
                >
                  GARMENT ORDERS
                </Text>
                <Pressable
                  testID="add-garment-button"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/customer-add-garment?customerId=${id}`);
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 16,
                    backgroundColor: 'rgba(201,169,110,0.08)',
                    borderWidth: 1,
                    borderColor: 'rgba(201,169,110,0.3)',
                  })}
                >
                  <Plus size={13} color="#C9A96E" strokeWidth={2} />
                  <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#C9A96E' }}>
                    Add
                  </Text>
                </Pressable>
              </View>

              {/* Summary chips */}
              {nonZeroGarments.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {nonZeroGarments.map((g) => (
                    <View
                      key={g.key}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 14,
                        backgroundColor: 'rgba(201,169,110,0.08)',
                        borderWidth: 1,
                        borderColor: 'rgba(201,169,110,0.25)',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>{g.emoji}</Text>
                      <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#C9A96E' }}>
                        {customer.garmentCounts[g.key]} {g.label}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Garment list */}
              {customer.garments && customer.garments.length > 0 ? (
                <View
                  style={{
                    backgroundColor: '#161616',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#2A2A2A',
                    overflow: 'hidden',
                  }}
                >
                  {customer.garments.map((garment, index) => {
                    const statusColor = getStatusColor(garment.status);
                    const statusLabel = getStatusLabel(garment.status);
                    const emoji = getGarmentEmoji(garment.type);
                    return (
                      <View
                        key={garment.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 16,
                          borderBottomWidth: index < customer.garments.length - 1 ? 1 : 0,
                          borderBottomColor: '#2A2A2A',
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: '#2A2A2A',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Text style={{ fontSize: 18 }}>{emoji}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontFamily: 'DMSans_500Medium',
                              fontSize: 14,
                              color: '#F5F0E8',
                              marginBottom: 2,
                              textTransform: 'capitalize',
                            }}
                          >
                            {garment.type}
                          </Text>
                          {garment.description ? (
                            <Text
                              style={{
                                fontFamily: 'DMSans_400Regular',
                                fontSize: 12,
                                color: '#A89880',
                                marginBottom: 6,
                              }}
                              numberOfLines={1}
                            >
                              {garment.description}
                            </Text>
                          ) : null}
                          <View
                            style={{
                              alignSelf: 'flex-start',
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 8,
                              backgroundColor: `${statusColor}18`,
                              borderWidth: 1,
                              borderColor: `${statusColor}40`,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: 'DMSans_500Medium',
                                fontSize: 10,
                                color: statusColor,
                                letterSpacing: 0.3,
                              }}
                            >
                              {statusLabel}
                            </Text>
                          </View>
                        </View>
                        <Pressable
                          testID={`delete-garment-${garment.id}`}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setDeleteGarmentId(garment.id);
                          }}
                          style={({ pressed }) => ({
                            opacity: pressed ? 0.6 : 1,
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            backgroundColor: 'rgba(244,67,54,0.08)',
                            borderWidth: 1,
                            borderColor: 'rgba(244,67,54,0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          })}
                        >
                          <Trash2 size={14} color="#F44336" strokeWidth={1.5} />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: 36,
                    backgroundColor: '#161616',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#2A2A2A',
                  }}
                >
                  <Text style={{ fontSize: 28, marginBottom: 10 }}>🧵</Text>
                  <Text
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      fontSize: 13,
                      color: '#A89880',
                      textAlign: 'center',
                    }}
                  >
                    No garment orders yet
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Delete Customer */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(200).duration(500))}
              style={{ paddingHorizontal: 24 }}
            >
              <Pressable
                testID="delete-customer-button"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setDeleteModalVisible(true);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#161616',
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(244,67,54,0.3)',
                  gap: 10,
                })}
              >
                <Trash2 size={16} color="#F44336" strokeWidth={1.5} />
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F44336' }}>
                  Delete Customer
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Delete Customer Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#1E1E1E',
              borderRadius: 20,
              padding: 28,
              width: '100%',
              maxWidth: 340,
              borderWidth: 1,
              borderColor: '#2A2A2A',
            }}
          >
            <Text
              style={{
                fontFamily: 'CormorantGaramond_700Bold',
                fontSize: 22,
                color: '#F5F0E8',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              Delete Customer?
            </Text>
            <Text
              style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 14,
                color: '#A89880',
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              This will permanently delete {customer.name} and all their garment orders. This cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                style={({ pressed }) => ({
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#2A2A2A',
                  alignItems: 'center',
                })}
              >
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8' }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                testID="confirm-delete-button"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  setDeleteModalVisible(false);
                  deleteCustomerMutation.mutate();
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: 'rgba(244,67,54,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(244,67,54,0.4)',
                  alignItems: 'center',
                })}
              >
                {deleteCustomerMutation.isPending ? (
                  <ActivityIndicator color="#F44336" size="small" />
                ) : (
                  <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F44336' }}>
                    Delete
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Garment Confirmation Modal */}
      <Modal
        visible={deleteGarmentId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteGarmentId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#1E1E1E',
              borderRadius: 20,
              padding: 28,
              width: '100%',
              maxWidth: 340,
              borderWidth: 1,
              borderColor: '#2A2A2A',
            }}
          >
            <Text
              style={{
                fontFamily: 'CormorantGaramond_700Bold',
                fontSize: 22,
                color: '#F5F0E8',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              Remove Garment?
            </Text>
            <Text
              style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 14,
                color: '#A89880',
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              This garment order will be permanently removed.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setDeleteGarmentId(null)}
                style={({ pressed }) => ({
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#2A2A2A',
                  alignItems: 'center',
                })}
              >
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8' }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                testID="confirm-delete-garment-button"
                onPress={() => {
                  if (deleteGarmentId) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    deleteGarmentMutation.mutate(deleteGarmentId);
                  }
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: 'rgba(244,67,54,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(244,67,54,0.4)',
                  alignItems: 'center',
                })}
              >
                {deleteGarmentMutation.isPending ? (
                  <ActivityIndicator color="#F44336" size="small" />
                ) : (
                  <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F44336' }}>
                    Remove
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
