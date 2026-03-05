import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Tag, Sparkles, TrendingUp } from 'lucide-react-native';

interface NotifSetting {
  id: string;
  icon: typeof Bell;
  title: string;
  description: string;
}

const NOTIF_SETTINGS: NotifSetting[] = [
  {
    id: 'fit_tips',
    icon: Sparkles,
    title: 'Fit Tips',
    description: 'Weekly personalised styling advice based on your measurements',
  },
  {
    id: 'new_trends',
    icon: TrendingUp,
    title: 'Trend Alerts',
    description: 'Get notified when new styles match your fit profile',
  },
  {
    id: 'reminders',
    icon: Bell,
    title: 'Scan Reminders',
    description: 'Monthly reminder to re-scan and update your measurements',
  },
  {
    id: 'offers',
    icon: Tag,
    title: 'Promotions & Offers',
    description: 'Exclusive deals from brands that match your style',
  },
];

export default function SettingsNotificationsScreen() {
  const router = useRouter();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    fit_tips: true,
    new_trends: true,
    reminders: false,
    offers: false,
  });

  const toggle = (id: string) => {
    Haptics.selectionAsync();
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
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
              Notifications
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
              Manage what we send you
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', marginBottom: 24 }}>
            {NOTIF_SETTINGS.map((item, index) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    padding: 18,
                    borderBottomWidth: index < NOTIF_SETTINGS.length - 1 ? 1 : 0,
                    borderBottomColor: '#2A2A2A',
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Icon size={16} color="#C9A96E" strokeWidth={1.5} />
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
                    value={enabled[item.id]}
                    onValueChange={() => toggle(item.id)}
                    trackColor={{ false: '#2A2A2A', true: 'rgba(201,169,110,0.5)' }}
                    thumbColor={enabled[item.id] ? '#C9A96E' : '#555'}
                  />
                </View>
              );
            })}
          </View>

          <View style={{ backgroundColor: '#161616', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A', padding: 16 }}>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', lineHeight: 18, textAlign: 'center' }}>
              You can also manage notifications from your device Settings at any time.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
