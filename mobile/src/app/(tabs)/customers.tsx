import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/api';
import { Plus, ChevronRight, Users } from 'lucide-react-native';

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
  garmentCounts: GarmentCounts;
}

const GARMENT_LABELS: Array<{ key: keyof Omit<GarmentCounts, 'total'>; label: string; emoji: string }> = [
  { key: 'blouse', label: 'blouse', emoji: '👚' },
  { key: 'pants', label: 'pants', emoji: '👖' },
  { key: 'dress', label: 'dress', emoji: '👗' },
  { key: 'shirt', label: 'shirt', emoji: '👔' },
  { key: 'skirt', label: 'skirt', emoji: '🩳' },
  { key: 'suit', label: 'suit', emoji: '🤵' },
  { key: 'other', label: 'other', emoji: '🧵' },
];

export default function CustomersScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: customers, isLoading, refetch } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => api.get<Customer[]>('/api/customers'),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const totalCustomers = customers?.length ?? 0;
  const totalBlouses = customers?.reduce((sum, c) => sum + (c.garmentCounts?.blouse ?? 0), 0) ?? 0;
  const totalPants = customers?.reduce((sum, c) => sum + (c.garmentCounts?.pants ?? 0), 0) ?? 0;
  const totalGarments = customers?.reduce((sum, c) => sum + (c.garmentCounts?.total ?? 0), 0) ?? 0;

  const stats = [
    { label: 'CUSTOMERS', value: totalCustomers.toString() },
    { label: 'BLOUSES', value: totalBlouses.toString() },
    { label: 'PANTS', value: totalPants.toString() },
    { label: 'GARMENTS', value: totalGarments.toString() },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="customers-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C9A96E"
              colors={['#C9A96E']}
            />
          }
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: 'CormorantGaramond_700Bold_Italic',
                fontSize: 32,
                color: '#F5F0E8',
              }}
            >
              Customers
            </Text>
            <Pressable
              testID="add-customer-button"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/customer-add');
              }}
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
              <Plus size={18} color="#C9A96E" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Stats Grid */}
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
                marginBottom: 12,
              }}
            >
              OVERVIEW
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
              {/* Row 1 */}
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 1,
                  borderBottomColor: '#2A2A2A',
                }}
              >
                {stats.slice(0, 2).map((stat, i) => (
                  <View
                    key={stat.label}
                    style={{
                      flex: 1,
                      padding: 20,
                      alignItems: 'center',
                      borderRightWidth: i === 0 ? 1 : 0,
                      borderRightColor: '#2A2A2A',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'DMSans_700Bold',
                        fontSize: 9,
                        color: '#A89880',
                        letterSpacing: 1.5,
                        marginBottom: 6,
                      }}
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'CormorantGaramond_700Bold',
                        fontSize: 28,
                        color: '#C9A96E',
                      }}
                    >
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>
              {/* Row 2 */}
              <View style={{ flexDirection: 'row' }}>
                {stats.slice(2, 4).map((stat, i) => (
                  <View
                    key={stat.label}
                    style={{
                      flex: 1,
                      padding: 20,
                      alignItems: 'center',
                      borderRightWidth: i === 0 ? 1 : 0,
                      borderRightColor: '#2A2A2A',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'DMSans_700Bold',
                        fontSize: 9,
                        color: '#A89880',
                        letterSpacing: 1.5,
                        marginBottom: 6,
                      }}
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'CormorantGaramond_700Bold',
                        fontSize: 28,
                        color: '#C9A96E',
                      }}
                    >
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Customer List */}
          <Animated.View
            entering={nativeEntering(FadeInDown.delay(100).duration(500))}
            style={{ paddingHorizontal: 24 }}
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
              ALL CUSTOMERS
            </Text>

            {isLoading ? (
              <View
                testID="loading-indicator"
                style={{
                  alignItems: 'center',
                  paddingVertical: 60,
                }}
              >
                <ActivityIndicator color="#C9A96E" />
                <Text
                  style={{
                    fontFamily: 'DMSans_400Regular',
                    fontSize: 13,
                    color: '#A89880',
                    marginTop: 12,
                  }}
                >
                  Loading customers...
                </Text>
              </View>
            ) : !customers || customers.length === 0 ? (
              <View
                testID="empty-state"
                style={{
                  alignItems: 'center',
                  paddingVertical: 60,
                  backgroundColor: '#161616',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  paddingHorizontal: 32,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: 'rgba(201,169,110,0.08)',
                    borderWidth: 1,
                    borderColor: 'rgba(201,169,110,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Users size={28} color="#C9A96E" strokeWidth={1.5} />
                </View>
                <Text
                  style={{
                    fontFamily: 'CormorantGaramond_700Bold',
                    fontSize: 22,
                    color: '#F5F0E8',
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  No Customers Yet
                </Text>
                <Text
                  style={{
                    fontFamily: 'DMSans_400Regular',
                    fontSize: 14,
                    color: '#A89880',
                    textAlign: 'center',
                    lineHeight: 22,
                    marginBottom: 28,
                  }}
                >
                  Start building your client book by adding your first customer.
                </Text>
                <Pressable
                  testID="add-first-customer-button"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/customer-add');
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    paddingHorizontal: 24,
                    paddingVertical: 13,
                    borderRadius: 28,
                    backgroundColor: '#C9A96E',
                  })}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: 14,
                      color: '#0A0A0A',
                    }}
                  >
                    Add your first customer
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: '#161616',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  overflow: 'hidden',
                }}
              >
                {customers.map((customer, index) => {
                  const nonZeroGarments = GARMENT_LABELS.filter(
                    (g) => (customer.garmentCounts?.[g.key] ?? 0) > 0
                  );
                  return (
                    <Pressable
                      key={customer.id}
                      testID={`customer-row-${customer.id}`}
                      onPress={() => {
                        Haptics.selectionAsync();
                        router.push(`/customer-detail?id=${customer.id}`);
                      }}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        borderBottomWidth: index < customers.length - 1 ? 1 : 0,
                        borderBottomColor: '#2A2A2A',
                        gap: 14,
                      })}
                    >
                      {/* Avatar */}
                      <LinearGradient
                        colors={['#C9A96E', '#A07840']}
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 23,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'CormorantGaramond_700Bold',
                            fontSize: 20,
                            color: '#0A0A0A',
                          }}
                        >
                          {customer.name.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>

                      {/* Info */}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={{
                            fontFamily: 'DMSans_500Medium',
                            fontSize: 15,
                            color: '#F5F0E8',
                            marginBottom: 3,
                          }}
                          numberOfLines={1}
                        >
                          {customer.name}
                        </Text>
                        {customer.phone || customer.email ? (
                          <Text
                            style={{
                              fontFamily: 'DMSans_400Regular',
                              fontSize: 12,
                              color: '#A89880',
                              marginBottom: nonZeroGarments.length > 0 ? 8 : 0,
                            }}
                            numberOfLines={1}
                          >
                            {customer.phone ?? customer.email}
                          </Text>
                        ) : null}
                        {nonZeroGarments.length > 0 ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              gap: 6,
                            }}
                          >
                            {nonZeroGarments.slice(0, 3).map((g) => (
                              <View
                                key={g.key}
                                style={{
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                  borderRadius: 10,
                                  backgroundColor: 'rgba(201,169,110,0.08)',
                                  borderWidth: 1,
                                  borderColor: 'rgba(201,169,110,0.2)',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 3,
                                }}
                              >
                                <Text style={{ fontSize: 10 }}>{g.emoji}</Text>
                                <Text
                                  style={{
                                    fontFamily: 'DMSans_400Regular',
                                    fontSize: 11,
                                    color: '#C9A96E',
                                  }}
                                >
                                  {customer.garmentCounts[g.key]} {g.label}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>

                      {/* Total badge + chevron */}
                      <View style={{ alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        {(customer.garmentCounts?.total ?? 0) > 0 ? (
                          <View
                            style={{
                              minWidth: 28,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: 'rgba(201,169,110,0.15)',
                              borderWidth: 1,
                              borderColor: 'rgba(201,169,110,0.3)',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingHorizontal: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: 'DMSans_500Medium',
                                fontSize: 11,
                                color: '#C9A96E',
                              }}
                            >
                              {customer.garmentCounts.total}
                            </Text>
                          </View>
                        ) : null}
                        <ChevronRight size={16} color="#3A3A3A" />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
