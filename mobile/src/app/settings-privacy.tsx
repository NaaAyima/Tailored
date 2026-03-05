import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, Database, Share2, Trash2 } from 'lucide-react-native';

export default function SettingsPrivacyScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    analytics: true,
    personalization: true,
    dataSharing: false,
  });

  const toggle = (key: keyof typeof settings) => {
    Haptics.selectionAsync();
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: '#161616',
              borderWidth: 1, borderColor: '#2A2A2A',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 14,
            })}
          >
            <ChevronLeft size={18} color="#F5F0E8" strokeWidth={1.5} />
          </Pressable>
          <View>
            <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 28, color: '#F5F0E8' }}>
              Privacy
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
              Control your data and permissions
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          {/* Toggles */}
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            DATA & PERSONALISATION
          </Text>
          <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', marginBottom: 28 }}>
            {[
              {
                key: 'analytics' as const,
                icon: Eye,
                title: 'Usage Analytics',
                description: 'Help us improve the app by sharing anonymous usage data',
              },
              {
                key: 'personalization' as const,
                icon: Database,
                title: 'Personalised Recommendations',
                description: 'Use your fit profile to surface better garment suggestions',
              },
              {
                key: 'dataSharing' as const,
                icon: Share2,
                title: 'Brand Data Sharing',
                description: 'Share anonymised sizing data with partner retailers',
              },
            ].map((item, index, arr) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.key}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    padding: 18,
                    borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                    borderBottomColor: '#2A2A2A',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Icon size={16} color="#A89880" strokeWidth={1.5} />
                  </View>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8', marginBottom: 2 }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', lineHeight: 17 }}>
                      {item.description}
                    </Text>
                  </View>
                  <Switch
                    value={settings[item.key]}
                    onValueChange={() => toggle(item.key)}
                    trackColor={{ false: '#2A2A2A', true: 'rgba(201,169,110,0.5)' }}
                    thumbColor={settings[item.key] ? '#C9A96E' : '#555'}
                  />
                </View>
              );
            })}
          </View>

          {/* Delete data */}
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            DATA MANAGEMENT
          </Text>
          <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', marginBottom: 24 }}>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                flexDirection: 'row', alignItems: 'center',
                padding: 18,
                borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
              })}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Database size={16} color="#A89880" strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8' }}>
                  Download My Data
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
                  Export a copy of your fit profile and history
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                flexDirection: 'row', alignItems: 'center',
                padding: 18,
              })}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(244,67,54,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: 'rgba(244,67,54,0.2)' }}>
                <Trash2 size={16} color="#F44336" strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F44336' }}>
                  Delete Account & Data
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
                  Permanently remove your account and all data
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={{ backgroundColor: '#161616', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', padding: 16 }}>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', lineHeight: 18, textAlign: 'center' }}>
              Your body measurements are stored locally on your device and never sold to third parties.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
