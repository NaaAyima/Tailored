import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Lock, ChevronLeft } from 'lucide-react-native';
import { authClient } from '@/lib/auth/auth-client';
import { useSession, useInvalidateSession } from '@/lib/auth/use-session';
import useTailoredStore from '@/lib/state/tailored-store';
import { nativeEntering } from '@/lib/entering';

const GENDER_OPTIONS = ['Men', 'Women', 'Non-binary'] as const;
type GenderOption = (typeof GENDER_OPTIONS)[number];

export default function ProfileEditScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const invalidateSession = useInvalidateSession();

  const storeUserName = useTailoredStore((s) => s.userName);
  const storeHeight = useTailoredStore((s) => s.height);
  const storeWeight = useTailoredStore((s) => s.weight);
  const setProfile = useTailoredStore((s) => s.setProfile);

  // Account section state
  const [name, setName] = useState<string>(session?.user?.name ?? '');
  const [isSavingAccount, setIsSavingAccount] = useState<boolean>(false);
  const [accountSuccess, setAccountSuccess] = useState<boolean>(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [nameFocused, setNameFocused] = useState<boolean>(false);

  // Fit profile section state
  const [displayName, setDisplayName] = useState<string>(storeUserName);
  const [heightVal, setHeightVal] = useState<string>(String(storeHeight));
  const [weightVal, setWeightVal] = useState<string>(storeWeight > 0 ? String(storeWeight) : '');
  const [gender, setGender] = useState<GenderOption>('Men');
  const [isSavingFit, setIsSavingFit] = useState<boolean>(false);
  const [fitSuccess, setFitSuccess] = useState<boolean>(false);
  const [displayNameFocused, setDisplayNameFocused] = useState<boolean>(false);
  const [heightFocused, setHeightFocused] = useState<boolean>(false);
  const [weightFocused, setWeightFocused] = useState<boolean>(false);

  const handleSaveAccount = async () => {
    setAccountError(null);
    setAccountSuccess(false);
    const trimmed = name.trim();
    if (!trimmed) {
      setAccountError('Name cannot be empty.');
      return;
    }
    setIsSavingAccount(true);
    try {
      const result = await authClient.updateUser({ name: trimmed });
      if (result.error) {
        setAccountError(result.error.message ?? 'Failed to save. Please try again.');
      } else {
        await invalidateSession();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setAccountSuccess(true);
        setTimeout(() => setAccountSuccess(false), 2500);
      }
    } catch {
      setAccountError('Something went wrong. Please try again.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSaveFit = async () => {
    setFitSuccess(false);
    setIsSavingFit(true);
    const parsedHeight = parseFloat(heightVal) || 175;
    const parsedWeight = parseFloat(weightVal) || 0;
    setProfile({
      userName: displayName.trim() || storeUserName,
      height: parsedHeight,
      weight: parsedWeight,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFitSuccess(true);
    setIsSavingFit(false);
    setTimeout(() => setFitSuccess(false), 2500);
  };

  const inputStyle = (focused: boolean) => ({
    backgroundColor: '#161616' as const,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: focused ? '#C9A96E' : '#2A2A2A',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  });

  const textInputStyle = {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#F5F0E8',
    flex: 1,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="profile-edit-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 48 }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: 'center', paddingTop: 10, marginBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#2A2A2A' }} />
            </View>

            {/* Nav row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, marginBottom: 4 }}>
              <Pressable
                testID="close-button"
                onPress={() => { Haptics.selectionAsync(); router.back(); }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#1E1E1E',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <ChevronLeft size={20} color="#F5F0E8" strokeWidth={1.5} />
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 13, color: '#C9A96E', letterSpacing: 3 }}>
                  TAILORED
                </Text>
              </View>
              {/* Spacer to balance the back button */}
              <View style={{ width: 40 }} />
            </View>

            {/* Heading */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(0).duration(500))}
              style={{ paddingHorizontal: 24, paddingTop: 16, marginBottom: 32 }}
            >
              <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 36, color: '#F5F0E8' }}>
                Edit Profile
              </Text>
            </Animated.View>

            {/* ---- ACCOUNT SECTION ---- */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(60).duration(500))}
              style={{ paddingHorizontal: 24, marginBottom: 32 }}
            >
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 16 }}>
                ACCOUNT
              </Text>

              {/* Name field */}
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#A89880', letterSpacing: 1, marginBottom: 8 }}>
                NAME
              </Text>
              <View style={inputStyle(nameFocused)}>
                <TextInput
                  testID="account-name-input"
                  value={name}
                  onChangeText={(t) => { setName(t); setAccountError(null); setAccountSuccess(false); }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Your name"
                  placeholderTextColor="#3A3A3A"
                  autoCapitalize="words"
                  returnKeyType="done"
                  style={textInputStyle}
                />
              </View>

              {/* Email field (read-only) */}
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#A89880', letterSpacing: 1, marginBottom: 8, marginTop: 16 }}>
                EMAIL
              </Text>
              <View style={[inputStyle(false), { borderColor: '#1E1E1E' }]}>
                <TextInput
                  testID="account-email-input"
                  value={session?.user?.email ?? ''}
                  editable={false}
                  placeholder="—"
                  placeholderTextColor="#3A3A3A"
                  style={[textInputStyle, { color: '#A89880' }]}
                />
                <Lock size={14} color="#A89880" strokeWidth={1.5} />
              </View>

              {/* Feedback */}
              {accountError ? (
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#F44336', marginTop: 10 }} testID="account-error">
                  {accountError}
                </Text>
              ) : null}
              {accountSuccess ? (
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#4CAF50', marginTop: 10 }} testID="account-success">
                  Account updated successfully.
                </Text>
              ) : null}

              {/* Save Account button */}
              <Pressable
                testID="save-account-button"
                onPress={handleSaveAccount}
                disabled={isSavingAccount}
                style={({ pressed }) => ({ opacity: pressed || isSavingAccount ? 0.75 : 1, marginTop: 20 })}
              >
                <LinearGradient
                  colors={['#C9A96E', '#A07840']}
                  style={{ height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}
                >
                  {isSavingAccount ? (
                    <ActivityIndicator color="#0A0A0A" size="small" testID="account-loading" />
                  ) : (
                    <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#0A0A0A', letterSpacing: 2 }}>
                      SAVE ACCOUNT
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#1E1E1E', marginHorizontal: 24, marginBottom: 32 }} />

            {/* ---- FIT PROFILE SECTION ---- */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(120).duration(500))}
              style={{ paddingHorizontal: 24 }}
            >
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 16 }}>
                FIT PROFILE
              </Text>

              {/* Display Name */}
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#A89880', letterSpacing: 1, marginBottom: 8 }}>
                DISPLAY NAME
              </Text>
              <View style={inputStyle(displayNameFocused)}>
                <TextInput
                  testID="display-name-input"
                  value={displayName}
                  onChangeText={setDisplayName}
                  onFocus={() => setDisplayNameFocused(true)}
                  onBlur={() => setDisplayNameFocused(false)}
                  placeholder="How you appear in the app"
                  placeholderTextColor="#3A3A3A"
                  autoCapitalize="words"
                  returnKeyType="done"
                  style={textInputStyle}
                />
              </View>

              {/* Height */}
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#A89880', letterSpacing: 1, marginBottom: 8, marginTop: 16 }}>
                HEIGHT (CM)
              </Text>
              <View style={inputStyle(heightFocused)}>
                <TextInput
                  testID="height-input"
                  value={heightVal}
                  onChangeText={setHeightVal}
                  onFocus={() => setHeightFocused(true)}
                  onBlur={() => setHeightFocused(false)}
                  placeholder="175"
                  placeholderTextColor="#3A3A3A"
                  keyboardType="numeric"
                  returnKeyType="done"
                  style={textInputStyle}
                />
              </View>

              {/* Weight */}
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#A89880', letterSpacing: 1, marginBottom: 8, marginTop: 16 }}>
                WEIGHT (KG) — OPTIONAL
              </Text>
              <View style={inputStyle(weightFocused)}>
                <TextInput
                  testID="weight-input"
                  value={weightVal}
                  onChangeText={setWeightVal}
                  onFocus={() => setWeightFocused(true)}
                  onBlur={() => setWeightFocused(false)}
                  placeholder="70"
                  placeholderTextColor="#3A3A3A"
                  keyboardType="numeric"
                  returnKeyType="done"
                  style={textInputStyle}
                />
              </View>

              {/* Gender toggle */}
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#A89880', letterSpacing: 1, marginBottom: 12, marginTop: 16 }}>
                GENDER
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {GENDER_OPTIONS.map((opt) => {
                  const active = gender === opt;
                  return (
                    <Pressable
                      key={opt}
                      testID={`gender-${opt.toLowerCase().replace(' ', '-')}`}
                      onPress={() => { setGender(opt); Haptics.selectionAsync(); }}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: active ? '#C9A96E' : '#2A2A2A',
                        backgroundColor: active ? 'rgba(201,169,110,0.12)' : '#161616',
                        alignItems: 'center',
                      })}
                    >
                      <Text style={{
                        fontFamily: active ? 'DMSans_500Medium' : 'DMSans_400Regular',
                        fontSize: 13,
                        color: active ? '#C9A96E' : '#A89880',
                      }}>
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Fit success feedback */}
              {fitSuccess ? (
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#4CAF50', marginTop: 12 }} testID="fit-success">
                  Fit profile saved.
                </Text>
              ) : null}

              {/* Save Fit Profile button */}
              <Pressable
                testID="save-fit-button"
                onPress={handleSaveFit}
                disabled={isSavingFit}
                style={({ pressed }) => ({ opacity: pressed || isSavingFit ? 0.75 : 1, marginTop: 24 })}
              >
                <LinearGradient
                  colors={['#C9A96E', '#A07840']}
                  style={{ height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}
                >
                  {isSavingFit ? (
                    <ActivityIndicator color="#0A0A0A" size="small" testID="fit-loading" />
                  ) : (
                    <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#0A0A0A', letterSpacing: 2 }}>
                      SAVE FIT PROFILE
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
