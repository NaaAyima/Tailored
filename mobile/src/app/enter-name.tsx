import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import { authClient } from '@/lib/auth/auth-client';
import { useInvalidateSession } from '@/lib/auth/use-session';
import * as Haptics from 'expo-haptics';

export default function EnterNameScreen() {
  const invalidateSession = useInvalidateSession();
  const [name, setName] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setError(null);
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await authClient.updateUser({ name: trimmed });
      if (result.error) {
        setError(result.error.message ?? 'Failed to save name. Please try again.');
      } else {
        await invalidateSession();
        // Stack.Protected handles navigation after session refresh
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="enter-name-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top — Branding */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(0).duration(700))}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 48 }}
            >
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_700Bold_Italic',
                  fontSize: 56,
                  color: '#F5F0E8',
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              >
                Tailored
              </Text>
              <View
                style={{
                  width: 40,
                  height: 1,
                  backgroundColor: '#C9A96E',
                  marginTop: 20,
                  opacity: 0.8,
                }}
              />
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 15,
                  color: '#A89880',
                  marginTop: 24,
                  textAlign: 'center',
                  lineHeight: 22,
                  paddingHorizontal: 40,
                }}
              >
                What should we call you?
              </Text>
            </Animated.View>

            {/* Name Input */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(150).duration(700))}
              style={{ paddingHorizontal: 28, paddingBottom: 16 }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  fontSize: 10,
                  color: '#A89880',
                  letterSpacing: 2.5,
                  marginBottom: 10,
                }}
              >
                YOUR NAME
              </Text>
              <Pressable
                onPress={() => inputRef.current?.focus()}
                style={{
                  backgroundColor: '#161616',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isFocused ? '#C9A96E' : '#2A2A2A',
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                }}
              >
                <TextInput
                  ref={inputRef}
                  testID="name-input"
                  value={name}
                  onChangeText={(text) => { setName(text); setError(null); }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#3A3A3A"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  autoFocus
                  style={{
                    fontFamily: 'DMSans_400Regular',
                    fontSize: 16,
                    color: '#F5F0E8',
                  }}
                />
              </Pressable>

              {error ? (
                <Text
                  style={{
                    fontFamily: 'DMSans_400Regular',
                    fontSize: 13,
                    color: '#F44336',
                    marginTop: 10,
                  }}
                  testID="error-text"
                >
                  {error}
                </Text>
              ) : null}

              <Animated.View
                entering={nativeEntering(FadeIn.delay(300).duration(500))}
                style={{ marginTop: 20 }}
              >
                <Pressable
                  testID="continue-button"
                  onPress={handleContinue}
                  disabled={isLoading}
                  style={({ pressed }) => ({ opacity: pressed || isLoading ? 0.8 : 1 })}
                >
                  <LinearGradient
                    colors={['#C9A96E', '#A07840']}
                    style={{
                      height: 58,
                      borderRadius: 29,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#0A0A0A" size="small" />
                    ) : (
                      <Text
                        style={{
                          fontFamily: 'DMSans_700Bold',
                          fontSize: 14,
                          color: '#0A0A0A',
                          letterSpacing: 2.5,
                        }}
                      >
                        CONTINUE
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </Animated.View>

            <Animated.View
              entering={nativeEntering(FadeInDown.delay(350).duration(600))}
              style={{ paddingHorizontal: 36, paddingBottom: 32, alignItems: 'center' }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_300Light',
                  fontSize: 11,
                  color: '#A89880',
                  textAlign: 'center',
                  lineHeight: 18,
                  opacity: 0.7,
                }}
              >
                This will be your display name throughout the app.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
