import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import { authClient } from '@/lib/auth/auth-client';
import { useInvalidateSession } from '@/lib/auth/use-session';
import { OtpInput, type OtpInputRef } from 'react-native-otp-entry';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const invalidateSession = useInvalidateSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);
  const otpRef = useRef<OtpInputRef | null>(null);

  const handleVerify = async (otp: string) => {
    if (otp.length !== 6) return;
    setError(null);
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await authClient.signIn.emailOtp({
        email: email ?? '',
        otp,
      });
      if (result.error) {
        setError(result.error.message ?? 'Invalid code. Please try again.');
        otpRef.current?.clear();
      } else {
        await invalidateSession();
        // Stack.Protected handles navigation automatically
      }
    } catch {
      setError('Something went wrong. Please try again.');
      otpRef.current?.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    setError(null);
    setIsResending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
    } catch {
      setError('Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="verify-otp-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Back Button */}
          <Pressable
            testID="back-button"
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              padding: 16,
              paddingLeft: 20,
              alignSelf: 'flex-start',
            })}
          >
            <ChevronLeft size={26} color="#F5F0E8" strokeWidth={1.5} />
          </Pressable>

          <View style={{ flex: 1, paddingHorizontal: 28 }}>
            {/* Header */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(0).duration(600))}
              style={{ marginBottom: 36 }}
            >
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_700Bold_Italic',
                  fontSize: 38,
                  color: '#F5F0E8',
                  lineHeight: 44,
                  marginBottom: 14,
                }}
              >
                Check your email
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 15,
                  color: '#A89880',
                  lineHeight: 22,
                }}
              >
                We sent a 6-digit code to{' '}
                <Text style={{ color: '#C9A96E', fontFamily: 'DMSans_500Medium' }}>
                  {email}
                </Text>
              </Text>
            </Animated.View>

            {/* OTP Input */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(100).duration(600))}
              style={{ marginBottom: 24 }}
            >
              <OtpInput
                ref={otpRef}
                numberOfDigits={6}
                type="numeric"
                onFilled={handleVerify}
                theme={{
                  containerStyle: {
                    gap: 8,
                  },
                  pinCodeContainerStyle: {
                    flex: 1,
                    height: 60,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: '#2A2A2A',
                    backgroundColor: '#161616',
                  },
                  focusedPinCodeContainerStyle: {
                    borderColor: '#C9A96E',
                  },
                  pinCodeTextStyle: {
                    fontFamily: 'DMSans_700Bold',
                    fontSize: 22,
                    color: '#F5F0E8',
                  },
                  focusStickStyle: {
                    backgroundColor: '#C9A96E',
                  },
                }}
              />
            </Animated.View>

            {/* Error */}
            {error ? (
              <Animated.Text
                entering={nativeEntering(FadeInDown.duration(300))}
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 13,
                  color: '#F44336',
                  marginBottom: 16,
                  textAlign: 'center',
                }}
                testID="error-text"
              >
                {error}
              </Animated.Text>
            ) : null}

            {/* Resend */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(200).duration(600))}
              style={{ alignItems: 'center' }}
            >
              <Pressable
                testID="resend-button"
                onPress={handleResend}
                disabled={isResending}
                style={({ pressed }) => ({ opacity: pressed || isResending ? 0.5 : 1 })}
              >
                <Text
                  style={{
                    fontFamily: 'DMSans_500Medium',
                    fontSize: 14,
                    color: '#A89880',
                  }}
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>

        {/* Loading overlay */}
        {isLoading ? (
          <View
            testID="loading-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(10,10,10,0.75)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color="#C9A96E" size="large" />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
