import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronLeft, ExternalLink, Star, MessageSquare, Shield, FileText } from 'lucide-react-native';

const VERSION = '1.0.0';
const BUILD = '42';

export default function SettingsAboutScreen() {
  const router = useRouter();

  const open = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  const links = [
    { id: 'rate', icon: Star, label: 'Rate Tailored', subtitle: 'Leave a review on the App Store', onPress: () => open('https://apps.apple.com') },
    { id: 'feedback', icon: MessageSquare, label: 'Send Feedback', subtitle: 'Help us improve the experience', onPress: () => open('mailto:hello@tailored.app') },
    { id: 'privacy', icon: Shield, label: 'Privacy Policy', subtitle: 'How we handle your data', onPress: () => open('https://tailored.app/privacy') },
    { id: 'terms', icon: FileText, label: 'Terms of Service', subtitle: 'Usage terms and conditions', onPress: () => open('https://tailored.app/terms') },
  ];

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
              About
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
              Tailored — Virtual Fitting Room
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          {/* Logo card */}
          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <LinearGradient
              colors={['#C9A96E', '#A07840']}
              style={{ width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
            >
              <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 36, color: '#0A0A0A' }}>T</Text>
            </LinearGradient>
            <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: '#F5F0E8', marginBottom: 4 }}>
              Tailored
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', marginBottom: 8 }}>
              Your personal virtual fitting room
            </Text>
            <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: '#161616', borderWidth: 1, borderColor: '#2A2A2A' }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#555' }}>
                Version {VERSION} (Build {BUILD})
              </Text>
            </View>
          </View>

          {/* What we do */}
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            ABOUT THE APP
          </Text>
          <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', padding: 18, marginBottom: 28 }}>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#C9A96E', lineHeight: 24, marginBottom: 12 }}>
              "Dress for the body you have, not the size on the label."
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', lineHeight: 20 }}>
              Tailored uses AI and computer vision to analyse your body measurements from photos, giving you personalised fit recommendations so every garment you buy fits perfectly.
            </Text>
          </View>

          {/* Features */}
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            FEATURES
          </Text>
          <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', padding: 18, marginBottom: 28 }}>
            {[
              { title: 'AI Body Scanning', desc: 'Estimate measurements from a single photo using GPT-4o vision' },
              { title: 'Virtual Try-On', desc: 'Visualise how garments will fit your unique body shape' },
              { title: 'Fit Profile', desc: 'Store your measurements and style preferences in one place' },
              { title: 'Smart Recommendations', desc: 'Get personalised sizing advice across brands' },
            ].map((f, i, arr) => (
              <View key={f.title} style={{ marginBottom: i < arr.length - 1 ? 14 : 0 }}>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#F5F0E8', marginBottom: 2 }}>{f.title}</Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', lineHeight: 17 }}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* Links */}
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            MORE
          </Text>
          <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', marginBottom: 24 }}>
            {links.map((item, index) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={item.onPress}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row', alignItems: 'center',
                    padding: 18,
                    borderBottomWidth: index < links.length - 1 ? 1 : 0,
                    borderBottomColor: '#2A2A2A',
                  })}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Icon size={16} color="#A89880" strokeWidth={1.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8', marginBottom: 1 }}>{item.label}</Text>
                    <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>{item.subtitle}</Text>
                  </View>
                  <ExternalLink size={14} color="#3A3A3A" strokeWidth={1.5} />
                </Pressable>
              );
            })}
          </View>

          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#3A3A3A', textAlign: 'center' }}>
            © 2025 Tailored. All rights reserved.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
