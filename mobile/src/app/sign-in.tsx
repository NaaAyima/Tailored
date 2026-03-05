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
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import { authClient } from '@/lib/auth/auth-client';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: trimmedEmail,
        type: 'sign-in',
      });
      if (result.error) {
        setError(result.error.message ?? 'Failed to send code. Please try again.');
      } else {
        router.push({ pathname: '/verify-otp' as never, params: { email: trimmedEmail } });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="sign-in-screen">
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
            {/* Top Section — Branding */}
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
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_400Regular_Italic',
                  fontSize: 18,
                  color: '#C9A96E',
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                Your perfect fit, every time.
              </Text>
              {/* Decorative gold line */}
              <View
                style={{
                  width: 40,
                  height: 1,
                  backgroundColor: '#C9A96E',
                  marginTop: 20,
                  opacity: 0.8,
                }}
              />
            </Animated.View>

            {/* Middle Section — Email Input */}
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
                EMAIL
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
                  testID="email-input"
                  value={email}
                  onChangeText={(text) => { setEmail(text); setError(null); }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="your@email.com"
                  placeholderTextColor="#3A3A3A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSendCode}
                  style={{
                    fontFamily: 'DMSans_400Regular',
                    fontSize: 16,
                    color: '#F5F0E8',
                  }}
                />
              </Pressable>

              {/* Error */}
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

              {/* Send Code Button */}
              <Animated.View
                entering={nativeEntering(FadeIn.delay(300).duration(500))}
                style={{ marginTop: 20 }}
              >
                <Pressable
                  testID="send-code-button"
                  onPress={handleSendCode}
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
                      <ActivityIndicator color="#0A0A0A" size="small" testID="loading-indicator" />
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

            {/* Bottom fine print */}
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
                By continuing, you agree to our Terms &amp; Privacy Policy.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
