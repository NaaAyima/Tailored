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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, FadeOutUp, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import { authClient } from '@/lib/auth/auth-client';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';

type Step = 'email' | 'name';

export default function SignInScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [nameFocused, setNameFocused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const handleEmailContinue = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('name');
    setTimeout(() => nameRef.current?.focus(), 300);
  };

  const handleSendCode = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setError(null);
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: trimmedEmail,
        type: 'sign-in',
      });
      if (result.error) {
        setError(result.error.message ?? 'Failed to send code. Please try again.');
      } else {
        router.push({
          pathname: '/verify-otp' as never,
          params: { email: trimmedEmail, name: trimmedName },
        });
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
            {/* Back button on name step */}
            <View style={{ height: 56, justifyContent: 'center' }}>
              {step === 'name' ? (
                <Pressable
                  onPress={() => { setStep('email'); setError(null); }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.6 : 1,
                    paddingHorizontal: 20,
                    alignSelf: 'flex-start',
                  })}
                >
                  <ChevronLeft size={26} color="#F5F0E8" strokeWidth={1.5} />
                </Pressable>
              ) : null}
            </View>

            {/* Branding */}
            <Animated.View
              entering={nativeEntering(FadeInDown.delay(0).duration(700))}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 48 }}
            >
              <Image
                source={require('../assets/logo.jpg')}
                style={{ width: 190, height: 190, borderRadius: 20 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_400Regular_Italic',
                  fontSize: 18,
                  color: '#C9A96E',
                  marginTop: 20,
                  textAlign: 'center',
                }}
              >
                {step === 'email' ? 'Your perfect fit, every time.' : 'Welcome to Tailored.'}
              </Text>
              <View
                style={{
                  width: 40,
                  height: 1,
                  backgroundColor: '#C9A96E',
                  marginTop: 16,
                  opacity: 0.8,
                }}
              />
            </Animated.View>

            {/* Step: Email */}
            {step === 'email' ? (
              <Animated.View
                key="email-step"
                entering={nativeEntering(FadeInDown.delay(150).duration(500))}
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
                  onPress={() => emailRef.current?.focus()}
                  style={{
                    backgroundColor: '#161616',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: emailFocused ? '#C9A96E' : '#2A2A2A',
                    paddingHorizontal: 18,
                    paddingVertical: 16,
                  }}
                >
                  <TextInput
                    ref={emailRef}
                    testID="email-input"
                    value={email}
                    onChangeText={(text) => { setEmail(text); setError(null); }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="your@email.com"
                    placeholderTextColor="#3A3A3A"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleEmailContinue}
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
                    style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#F44336', marginTop: 10 }}
                    testID="error-text"
                  >
                    {error}
                  </Text>
                ) : null}

                <Animated.View entering={nativeEntering(FadeIn.delay(300).duration(500))} style={{ marginTop: 20 }}>
                  <Pressable
                    testID="continue-button"
                    onPress={handleEmailContinue}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <LinearGradient
                      colors={['#C9A96E', '#A07840']}
                      style={{ height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }}
                    >
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
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </Animated.View>
            ) : (
              /* Step: Name */
              <Animated.View
                key="name-step"
                entering={nativeEntering(FadeInDown.delay(0).duration(400))}
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
                  onPress={() => nameRef.current?.focus()}
                  style={{
                    backgroundColor: '#161616',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: nameFocused ? '#C9A96E' : '#2A2A2A',
                    paddingHorizontal: 18,
                    paddingVertical: 16,
                  }}
                >
                  <TextInput
                    ref={nameRef}
                    testID="name-input"
                    value={name}
                    onChangeText={(text) => { setName(text); setError(null); }}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder="Enter your full name"
                    placeholderTextColor="#3A3A3A"
                    autoCapitalize="words"
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

                {error ? (
                  <Text
                    style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#F44336', marginTop: 10 }}
                    testID="error-text"
                  >
                    {error}
                  </Text>
                ) : null}

                <Animated.View entering={nativeEntering(FadeIn.delay(100).duration(400))} style={{ marginTop: 20 }}>
                  <Pressable
                    testID="send-code-button"
                    onPress={handleSendCode}
                    disabled={isLoading}
                    style={({ pressed }) => ({ opacity: pressed || isLoading ? 0.8 : 1 })}
                  >
                    <LinearGradient
                      colors={['#C9A96E', '#A07840']}
                      style={{ height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }}
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
                          SEND CODE
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </Animated.View>
            )}

            {/* Fine print */}
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
