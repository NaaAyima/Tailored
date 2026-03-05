import React from 'react';
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
import { ChevronRight, Bell, Shield, Ruler, Info, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authClient } from '@/lib/auth/auth-client';
import { useSession, useInvalidateSession } from '@/lib/auth/use-session';

const STYLE_PREFS = ['Minimalist', 'Streetwear', 'Formal', 'Casual', 'Athletic', 'Avant-garde'];

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const invalidateSession = useInvalidateSession();
  const userName = useTailoredStore((s) => s.userName);
  const height = useTailoredStore((s) => s.height);
  const weight = useTailoredStore((s) => s.weight);
  const bodyType = useTailoredStore((s) => s.bodyType);
  const measurements = useTailoredStore((s) => s.measurements);
  const hasCompletedProfile = useTailoredStore((s) => s.hasCompletedProfile);
  const stylePreferences = useTailoredStore((s) => s.stylePreferences);
  const toggleStylePreference = useTailoredStore((s) => s.toggleStylePreference);

  const bodyTypeLabel = bodyType
    ? bodyType.charAt(0).toUpperCase() + bodyType.slice(1)
    : 'Unknown';

  const displayName = session?.user?.name ?? userName;

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await authClient.signOut();
    await invalidateSession();
  };

  const settingsItems = [
    { icon: Bell, label: 'Notifications', id: 'notifications', route: '/settings-notifications' },
    { icon: Shield, label: 'Privacy', id: 'privacy', route: '/settings-privacy' },
    { icon: Ruler, label: 'Units (cm/in)', id: 'units', route: '/settings-units' },
    { icon: Info, label: 'About Tailored', id: 'about', route: '/settings-about' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="profile-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 }}>
            <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 32, color: '#F5F0E8' }}>
              Profile
            </Text>
          </View>

          {/* Avatar + Name */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(50).duration(500))} style={{ alignItems: 'center', paddingBottom: 8 }}>
            <LinearGradient
              colors={['#C9A96E', '#A07840']}
              style={{ width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}
            >
              <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 36, color: '#0A0A0A' }}>
                {displayName.charAt(0)}
              </Text>
            </LinearGradient>
            <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: '#F5F0E8', marginBottom: 6 }}>
              {displayName}
            </Text>
            {session?.user?.email ? (
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', marginBottom: 10 }}>
                {session.user.email}
              </Text>
            ) : null}
            <View style={{
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 20,
              backgroundColor: hasCompletedProfile ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
              borderWidth: 1,
              borderColor: hasCompletedProfile ? 'rgba(76,175,80,0.4)' : 'rgba(255,152,0,0.4)',
            }}>
              <Text style={{
                fontFamily: 'DMSans_500Medium',
                fontSize: 11,
                color: hasCompletedProfile ? '#4CAF50' : '#FF9800',
                letterSpacing: 0.5,
              }}>
                {hasCompletedProfile ? 'Fit Profile: Complete' : 'Fit Profile: Incomplete'}
              </Text>
            </View>
            <Pressable
              testID="edit-profile-button"
              onPress={() => { Haptics.selectionAsync(); router.push('/profile-edit'); }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                marginTop: 16,
                paddingHorizontal: 20,
                paddingVertical: 9,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(201,169,110,0.5)',
                backgroundColor: 'rgba(201,169,110,0.08)',
              })}
            >
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#C9A96E' }}>
                Edit Profile
              </Text>
            </Pressable>
          </Animated.View>

          {/* Spacer before body stats */}
          <View style={{ height: 28 }} />

          {/* Body Stats Card */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(100).duration(500))} style={{ paddingHorizontal: 24, marginBottom: 16 }}>
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
              BODY STATS
            </Text>
            <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row' }}>
                {[
                  { label: 'HEIGHT', value: `${height} cm` },
                  { label: 'WEIGHT', value: weight > 0 ? `${weight} kg` : '—' },
                  { label: 'TYPE', value: bodyTypeLabel },
                ].map((stat, i) => (
                  <View
                    key={stat.label}
                    style={{
                      flex: 1,
                      padding: 18,
                      borderRightWidth: i < 2 ? 1 : 0,
                      borderRightColor: '#2A2A2A',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: '#A89880', letterSpacing: 1.5, marginBottom: 6 }}>
                      {stat.label}
                    </Text>
                    <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: '#F5F0E8' }}>
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Measurements Card */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(150).duration(500))} style={{ paddingHorizontal: 24, marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2 }}>
                MEASUREMENTS
              </Text>
              <Pressable
                testID="edit-measurements-button"
                onPress={() => { Haptics.selectionAsync(); router.push('/measurements-edit'); }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#C9A96E' }}>
                  Edit
                </Text>
              </Pressable>
            </View>
            <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' }}>
              {/* Row 1: Chest, Waist, Hips */}
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' }}>
                {[
                  { label: 'CHEST', value: measurements.chest > 0 ? `${measurements.chest} cm` : '—' },
                  { label: 'WAIST', value: measurements.waist > 0 ? `${measurements.waist} cm` : '—' },
                  { label: 'HIPS', value: measurements.hips > 0 ? `${measurements.hips} cm` : '—' },
                ].map((m, i) => (
                  <View
                    key={m.label}
                    style={{
                      flex: 1,
                      padding: 18,
                      borderRightWidth: i < 2 ? 1 : 0,
                      borderRightColor: '#2A2A2A',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: '#A89880', letterSpacing: 1.5, marginBottom: 6 }}>
                      {m.label}
                    </Text>
                    <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: '#F5F0E8' }}>
                      {m.value}
                    </Text>
                  </View>
                ))}
              </View>
              {/* Row 2: Shoulder, Inseam */}
              <View style={{ flexDirection: 'row' }}>
                {[
                  { label: 'SHOULDER', value: measurements.shoulder > 0 ? `${measurements.shoulder} cm` : '—' },
                  { label: 'INSEAM', value: measurements.inseam > 0 ? `${measurements.inseam} cm` : '—' },
                ].map((m, i) => (
                  <View
                    key={m.label}
                    style={{
                      flex: 1,
                      padding: 18,
                      borderRightWidth: i < 1 ? 1 : 0,
                      borderRightColor: '#2A2A2A',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 9, color: '#A89880', letterSpacing: 1.5, marginBottom: 6 }}>
                      {m.label}
                    </Text>
                    <Text style={{ fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: '#F5F0E8' }}>
                      {m.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Style Preferences */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(200).duration(500))} style={{ paddingHorizontal: 24, marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2 }}>
                STYLE PREFERENCES
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {STYLE_PREFS.map((pref) => {
                const isActive = stylePreferences.includes(pref);
                return (
                  <Pressable
                    key={pref}
                    testID={`style-pref-${pref.toLowerCase()}`}
                    onPress={() => { toggleStylePreference(pref); Haptics.selectionAsync(); }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.75 : 1,
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      borderRadius: 24,
                      borderWidth: 1,
                      borderColor: isActive ? '#C9A96E' : '#2A2A2A',
                      backgroundColor: isActive ? 'rgba(201,169,110,0.12)' : '#161616',
                    })}
                  >
                    <Text style={{
                      fontFamily: isActive ? 'DMSans_500Medium' : 'DMSans_400Regular',
                      fontSize: 13,
                      color: isActive ? '#C9A96E' : '#A89880',
                    }}>
                      {pref}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Garment Preferences */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(225).duration(500))} style={{ paddingHorizontal: 24, marginBottom: 28 }}>
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
              GARMENT PREFERENCES
            </Text>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); router.push('/garment-preferences'); }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                backgroundColor: '#161616',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#2A2A2A',
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
              })}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8', marginBottom: 3 }}>
                  Sleeve, neck, fit & more
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
                  Used by the AI when analysing your photos
                </Text>
              </View>
              <ChevronRight size={16} color="#3A3A3A" />
            </Pressable>
          </Animated.View>

          {/* Settings */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(250).duration(500))} style={{ paddingHorizontal: 24, marginBottom: 28 }}>
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
              SETTINGS
            </Text>
            <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' }}>
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.id}
                    testID={`settings-${item.id}`}
                    onPress={() => { Haptics.selectionAsync(); router.push(item.route as never); }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 18,
                      borderBottomWidth: index < settingsItems.length - 1 ? 1 : 0,
                      borderBottomColor: '#2A2A2A',
                    })}
                  >
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                      <Icon size={16} color="#A89880" strokeWidth={1.5} />
                    </View>
                    <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#F5F0E8', flex: 1 }}>
                      {item.label}
                    </Text>
                    <ChevronRight size={16} color="#3A3A3A" />
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Sign Out */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(300).duration(500))} style={{ paddingHorizontal: 24 }}>
            <Pressable
              testID="sign-out-button"
              onPress={handleSignOut}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#161616',
                borderRadius: 14,
                padding: 18,
                borderWidth: 1,
                borderColor: 'rgba(244,67,54,0.3)',
                gap: 10,
              })}
            >
              <LogOut size={16} color="#F44336" strokeWidth={1.5} />
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F44336' }}>
                Sign Out
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
