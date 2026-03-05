import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import useTailoredStore from '@/lib/state/tailored-store';
import { Link2, Camera, ChevronRight, ImageIcon, X } from 'lucide-react-native';
import { ClothingItem } from '@/lib/state/tailored-store';
import { TextInput } from 'react-native';
import { DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api/api';

interface ImportedPhoto {
  uri: string;
  name: string;
}

interface MeasurementAnalysis {
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

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
  const [importedPhotos, setImportedPhotos] = useState<ImportedPhoto[]>([]);
  const [analysisResult, setAnalysisResult] = useState<MeasurementAnalysis | null>(null);
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);

  const savedItems = useTailoredStore((s) => s.savedItems);
  const height = useTailoredStore((s) => s.height);
  const setProfile = useTailoredStore((s) => s.setProfile);
  const router = useRouter();

  const activeItem: ClothingItem | null = savedItems[0] ?? null;

  const handlePickPhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to import clothing images.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newPhotos: ImportedPhoto[] = result.assets.map((asset, i) => ({
        uri: asset.uri,
        name: asset.fileName ?? `Clothing item ${importedPhotos.length + i + 1}`,
      }));
      setImportedPhotos((prev) => [...newPhotos, ...prev]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const analyzePhoto = async (photo: ImportedPhoto, index: number) => {
    try {
      setAnalyzingIndex(index);
      setAnalysisResult(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const ext = photo.uri.toLowerCase();
      const mimeType = ext.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const imageBase64 = `data:${mimeType};base64,${base64}`;

      const result = await api.post<MeasurementAnalysis>('/api/measurements/analyze', {
        imageBase64,
        heightCm: height,
      });

      setAnalysisResult(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Analysis Failed', 'Could not analyse the photo. Please try again.');
    } finally {
      setAnalyzingIndex(null);
    }
  };

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
                onPress={handlePickPhoto}
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
                  marginBottom: importedPhotos.length > 0 ? 20 : 36,
                })}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <ImageIcon size={22} color="#C9A96E" strokeWidth={1.5} />
                </View>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8', marginBottom: 4 }}>Choose from Library</Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
                  Select up to 5 photos
                </Text>
              </Pressable>

              {/* Imported Photos Grid */}
              {importedPhotos.length > 0 && (
                <View style={{ marginBottom: 28 }}>
                  <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
                    IMPORTED ({importedPhotos.length})
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {importedPhotos.map((photo, index) => (
                      <View key={`${photo.uri}-${index}`} style={{ width: '47%', aspectRatio: 0.75, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' }}>
                        <Image
                          source={{ uri: photo.uri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                        {/* Remove button */}
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setImportedPhotos((prev) => prev.filter((_, i) => i !== index));
                          }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.2)',
                          }}
                        >
                          <X size={13} color="#F5F0E8" strokeWidth={2} />
                        </Pressable>
                        {/* Bottom overlay with name + Analyse button */}
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 10, color: '#F5F0E8', flex: 1 }} numberOfLines={1}>
                            {photo.name}
                          </Text>
                          <Pressable
                            onPress={() => analyzePhoto(photo, index)}
                            disabled={analyzingIndex !== null}
                            testID={`analyse-button-${index}`}
                            style={({ pressed }) => ({
                              opacity: pressed ? 0.7 : analyzingIndex !== null ? 0.4 : 1,
                              backgroundColor: 'rgba(201,169,110,0.9)',
                              borderRadius: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              marginLeft: 6,
                            })}
                          >
                            {analyzingIndex === index ? (
                              <ActivityIndicator size="small" color="#0A0A0A" />
                            ) : (
                              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 10, color: '#0A0A0A' }}>
                                Analyse
                              </Text>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Analysis Result Panel */}
              {analysisResult !== null && (
                <Animated.View entering={nativeEntering(FadeInDown.duration(400))} style={{ marginBottom: 28 }}>
                  {/* Header row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2 }}>
                        AI MEASUREMENTS
                      </Text>
                      {/* Confidence badge */}
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 10,
                        backgroundColor: analysisResult.confidence === 'high' ? 'rgba(76,175,80,0.15)' : analysisResult.confidence === 'medium' ? 'rgba(255,152,0,0.15)' : 'rgba(244,67,54,0.15)',
                        borderWidth: 1,
                        borderColor: analysisResult.confidence === 'high' ? 'rgba(76,175,80,0.4)' : analysisResult.confidence === 'medium' ? 'rgba(255,152,0,0.4)' : 'rgba(244,67,54,0.4)',
                      }}>
                        <Text style={{
                          fontFamily: 'DMSans_500Medium',
                          fontSize: 9,
                          letterSpacing: 1,
                          color: analysisResult.confidence === 'high' ? '#4CAF50' : analysisResult.confidence === 'medium' ? '#FF9800' : '#F44336',
                        }}>
                          {analysisResult.confidence.toUpperCase()} CONFIDENCE
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => setAnalysisResult(null)}
                      style={{ padding: 4 }}
                      testID="close-analysis-button"
                    >
                      <X size={14} color="#A89880" />
                    </Pressable>
                  </View>

                  {/* Measurement grid */}
                  <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' }}>
                      {[
                        { label: 'CHEST', value: analysisResult.chest },
                        { label: 'WAIST', value: analysisResult.waist },
                        { label: 'HIPS', value: analysisResult.hips },
                      ].map((m, i) => (
                        <View key={m.label} style={{ flex: 1, padding: 16, alignItems: 'center', borderRightWidth: i < 2 ? 1 : 0, borderRightColor: '#2A2A2A' }}>
                          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: '#A89880', letterSpacing: 1.5, marginBottom: 4 }}>
                            {m.label}
                          </Text>
                          <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: '#C9A96E' }}>
                            {m.value}
                          </Text>
                          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 9, color: '#A89880' }}>cm</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      {[
                        { label: 'SHOULDER', value: analysisResult.shoulder },
                        { label: 'INSEAM', value: analysisResult.inseam },
                      ].map((m, i) => (
                        <View key={m.label} style={{ flex: 1, padding: 16, alignItems: 'center', borderRightWidth: i < 1 ? 1 : 0, borderRightColor: '#2A2A2A' }}>
                          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: '#A89880', letterSpacing: 1.5, marginBottom: 4 }}>
                            {m.label}
                          </Text>
                          <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: '#C9A96E' }}>
                            {m.value}
                          </Text>
                          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 9, color: '#A89880' }}>cm</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* AI Notes */}
                  {analysisResult.notes ? (
                    <View style={{ backgroundColor: '#161616', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 12 }}>
                      <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: '#A89880', lineHeight: 20 }}>
                        "{analysisResult.notes}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Save to profile button */}
                  <Pressable
                    testID="save-measurements-button"
                    onPress={() => {
                      setProfile({
                        measurements: {
                          chest: analysisResult.chest,
                          waist: analysisResult.waist,
                          hips: analysisResult.hips,
                          shoulder: analysisResult.shoulder,
                          inseam: analysisResult.inseam,
                        },
                        hasCompletedProfile: true,
                      });
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Alert.alert('Saved', 'Measurements saved to your fit profile.');
                      setAnalysisResult(null);
                    }}
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                  >
                    <LinearGradient
                      colors={['#C9A96E', '#A07840']}
                      style={{ height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#0A0A0A', letterSpacing: 1.5 }}>
                        SAVE TO FIT PROFILE
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              )}

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
