import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import useTailoredStore from '@/lib/state/tailored-store';
import { Link2, Camera, ChevronRight } from 'lucide-react-native';
import { ClothingItem } from '@/lib/state/tailored-store';
import { TextInput } from 'react-native';
import { DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';

function fitScoreColor(score: number): string {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#F44336';
}

type TabType = 'import' | 'virtual';

interface TensionPoint {
  top: DimensionValue;
  left: DimensionValue;
  color: string;
  label: string;
}

const tensionPoints: TensionPoint[] = [
  { top: '28%', left: '30%', color: '#FF9800', label: 'Shoulder' },
  { top: '42%', left: '25%', color: '#4CAF50', label: 'Chest' },
  { top: '56%', left: '50%', color: '#F44336', label: 'Waist' },
  { top: '70%', left: '38%', color: '#4CAF50', label: 'Hip' },
];

export default function TryOnScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('import');
  const [urlInput, setUrlInput] = useState<string>('');
  const savedItems = useTailoredStore((s) => s.savedItems);
  const router = useRouter();

  const activeItem: ClothingItem | null = savedItems[0] ?? null;

  const emojiMap: Record<string, string> = {
    shirt: '👔',
    pants: '👖',
    jacket: '🧥',
    top: '👕',
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="tryon-screen">
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20 }}>
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 32, color: '#F5F0E8', marginBottom: 4 }}>
            Try On
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880' }}>
            Import garments and visualise your fit
          </Text>
        </View>

        {/* Segmented Control */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#161616', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#2A2A2A' }}>
            {([
              { key: 'import' as TabType, label: 'Import Clothing' },
              { key: 'virtual' as TabType, label: 'Virtual Fit' },
            ]).map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => { setActiveTab(tab.key); Haptics.selectionAsync(); }}
                testID={`tab-${tab.key}`}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 9,
                  alignItems: 'center',
                  backgroundColor: activeTab === tab.key ? '#C9A96E' : 'transparent',
                }}
              >
                <Text style={{
                  fontFamily: 'DMSans_500Medium',
                  fontSize: 13,
                  color: activeTab === tab.key ? '#0A0A0A' : '#A89880',
                }}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {activeTab === 'import' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
            <Animated.View entering={nativeEntering(FadeInDown.duration(400))}>
              {/* URL Input */}
              <View style={{
                backgroundColor: '#161616',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#2A2A2A',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 20,
              }}>
                <Link2 size={18} color="#A89880" strokeWidth={1.5} style={{ marginRight: 12 }} />
                <TextInput
                  testID="url-input"
                  value={urlInput}
                  onChangeText={setUrlInput}
                  placeholder="Paste product URL here"
                  placeholderTextColor="#3A3A3A"
                  style={{
                    flex: 1,
                    fontFamily: 'DMSans_400Regular',
                    fontSize: 14,
                    color: '#F5F0E8',
                    paddingVertical: 18,
                  }}
                />
              </View>

              {/* OR divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', marginHorizontal: 16 }}>OR</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
              </View>

              {/* Upload Photo Button */}
              <Pressable
                testID="upload-photo-button"
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  borderStyle: 'dashed',
                  paddingVertical: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#161616',
                  marginBottom: 36,
                })}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Camera size={22} color="#C9A96E" strokeWidth={1.5} />
                </View>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8', marginBottom: 4 }}>Upload Photo</Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
                  JPG, PNG or HEIC
                </Text>
              </Pressable>

              {/* Recent imports */}
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#F5F0E8', marginBottom: 16 }}>
                Recent Imports
              </Text>
              {savedItems.slice(0, 3).map((item) => (
                <Pressable
                  key={item.id}
                  testID={`recent-import-${item.id}`}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#161616',
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#2A2A2A',
                  })}
                >
                  <LinearGradient
                    colors={['#2A2A2A', '#1E1E1E']}
                    style={{ width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}
                  >
                    <Text style={{ fontSize: 24 }}>{emojiMap[item.category] ?? '👕'}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#F5F0E8', marginBottom: 2 }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880' }}>
                      {item.brand} · {item.price}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 20,
                      backgroundColor: `${fitScoreColor(item.fitScore)}22`,
                      borderWidth: 1,
                      borderColor: `${fitScoreColor(item.fitScore)}44`,
                    }}>
                      <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color: fitScoreColor(item.fitScore) }}>
                        View Fit
                      </Text>
                    </View>
                    <ChevronRight size={14} color="#A89880" />
                  </View>
                </Pressable>
              ))}
            </Animated.View>
          </ScrollView>
        )}

        {activeTab === 'virtual' && (
          <Animated.View entering={nativeEntering(FadeInDown.duration(400))} style={{ flex: 1 }}>
            {/* Scan Body button */}
            <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
              <Pressable
                onPress={() => { router.push('/body-scan'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                testID="scan-body-button"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: 'rgba(201,169,110,0.5)',
                  backgroundColor: 'rgba(201,169,110,0.07)',
                  alignSelf: 'flex-start',
                })}
              >
                <Camera size={16} color="#C9A96E" strokeWidth={1.5} />
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#C9A96E' }}>
                  Scan Body
                </Text>
              </Pressable>
            </View>

            {/* Body silhouette area */}
            <View style={{ flex: 1, paddingHorizontal: 24, position: 'relative' }}>
              <LinearGradient
                colors={['#161616', '#1E1E1E', '#161616']}
                style={{ flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
              >
                {/* Body silhouette */}
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(201,169,110,0.15)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)', marginBottom: 8 }} />
                  <View style={{ width: 20, height: 16, backgroundColor: 'rgba(201,169,110,0.1)' }} />
                  <View style={{ width: 140, height: 24, borderRadius: 12, backgroundColor: 'rgba(201,169,110,0.12)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.2)', marginBottom: 2 }} />
                  <View style={{ width: 100, height: 90, borderRadius: 8, backgroundColor: 'rgba(201,169,110,0.08)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.15)', marginBottom: 2 }} />
                  <View style={{ width: 120, height: 30, borderRadius: 10, backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.2)', marginBottom: 2 }} />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ width: 50, height: 110, borderRadius: 10, backgroundColor: 'rgba(201,169,110,0.07)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.15)' }} />
                    <View style={{ width: 50, height: 110, borderRadius: 10, backgroundColor: 'rgba(201,169,110,0.07)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.15)' }} />
                  </View>
                </View>

                {/* Tension point indicators - using absolute within the gradient container */}
                <View style={{ position: 'absolute', top: '28%', left: '30%', width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF9800', opacity: 0.85 }} />
                <View style={{ position: 'absolute', top: '42%', left: '25%', width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', opacity: 0.85 }} />
                <View style={{ position: 'absolute', top: '56%', left: '50%', width: 10, height: 10, borderRadius: 5, backgroundColor: '#F44336', opacity: 0.85 }} />
                <View style={{ position: 'absolute', top: '70%', left: '38%', width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', opacity: 0.85 }} />

                {/* Fit score badge */}
                <View style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: 'rgba(201,169,110,0.4)',
                }}>
                  <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 14, color: '#C9A96E' }}>
                    {activeItem ? `${activeItem.fitScore}%` : '—'}
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 9, color: '#A89880', textAlign: 'center' }}>
                    FIT
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Outfit selector */}
            <View style={{ paddingTop: 16, paddingBottom: 8 }}>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, paddingHorizontal: 24, marginBottom: 12 }}>
                YOUR WARDROBE
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
                style={{ flexGrow: 0 }}
              >
                {savedItems.map((item, index) => (
                  <Pressable
                    key={item.id}
                    testID={`wardrobe-item-${item.id}`}
                    onPress={() => Haptics.selectionAsync()}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 14,
                      marginRight: 10,
                      borderWidth: 2,
                      borderColor: index === 0 ? '#C9A96E' : '#2A2A2A',
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={['#2A2A2A', '#1E1E1E']}
                      style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ fontSize: 24 }}>{emojiMap[item.category] ?? '👕'}</Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Bottom analysis panel */}
            <View style={{ marginHorizontal: 24, marginBottom: 16, backgroundColor: '#161616', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A2A' }}>
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#F5F0E8', marginBottom: 6 }}>
                {activeItem?.name ?? 'Select a garment'}
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', lineHeight: 18 }}>
                Slight tension across shoulders. Waist sits well. Consider sizing up for more ease.
              </Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
