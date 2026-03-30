import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import useTailoredStore from '@/lib/state/tailored-store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    id: 0,
    headline: 'Your Body.\nYour Rules.',
    subtext: 'Advanced 3D body scanning technology maps your unique proportions — so every garment fits like it was made for you.',
    gradientColors: ['#1a0a00', '#0A0A0A', '#0d1a2e'] as const,
    orbColors: ['#C9A96E', '#8B5E2A', '#0A0A0A'] as const,
  },
  {
    id: 1,
    headline: 'Every Garment.\nPerfectly Fit.',
    subtext: 'Import clothing from any brand, any store. Our AI analyses cut, fabric and construction to predict how it will fit your body.',
    gradientColors: ['#0d1a0d', '#0A0A0A', '#1a0d00'] as const,
    orbColors: ['#4A90D9', '#1a3a5c', '#0A0A0A'] as const,
  },
  {
    id: 2,
    headline: 'AI That\nUnderstands Fashion.',
    subtext: 'Trained on millions of garments and fit profiles, our AI speaks the language of fashion — and the science of fit.',
    gradientColors: ['#0a0a1a', '#0A0A0A', '#1a0a0a'] as const,
    orbColors: ['#A96EC9', '#5c1a5c', '#0A0A0A'] as const,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const setProfile = useTailoredStore((s) => s.setProfile);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * SCREEN_WIDTH, animated: true });
    }
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProfile({ hasCompletedOnboarding: true });
    router.replace('/profile-setup');
  };

  const hasCompletedProfile = useTailoredStore((s) => s.hasCompletedProfile);

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProfile({ hasCompletedOnboarding: true });
    router.replace(hasCompletedProfile ? '/(tabs)' : '/profile-setup');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Skip button */}
      <SafeAreaView style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
        <Pressable
          onPress={handleSkip}
          testID="skip-button"
          className="mr-6 mt-2 py-2 px-4"
        >
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', letterSpacing: 1 }}>
            SKIP
          </Text>
        </Pressable>
      </SafeAreaView>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <LinearGradient
              colors={slide.gradientColors}
              style={{ flex: 1 }}
            >
              {/* Orb visual */}
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85, alignItems: 'center', justifyContent: 'center', marginTop: 60 }}>
                  <LinearGradient
                    colors={slide.orbColors}
                    style={{
                      width: SCREEN_WIDTH * 0.7,
                      height: SCREEN_WIDTH * 0.7,
                      borderRadius: SCREEN_WIDTH * 0.35,
                      opacity: 0.6,
                    }}
                  />
                  {/* Inner orb glow */}
                  <View
                    style={{
                      position: 'absolute',
                      width: SCREEN_WIDTH * 0.35,
                      height: SCREEN_WIDTH * 0.35,
                      borderRadius: SCREEN_WIDTH * 0.175,
                      backgroundColor: slide.orbColors[0],
                      opacity: 0.25,
                    }}
                  />
                  {/* Brand mark */}
                  <View style={{ position: 'absolute', alignItems: 'center' }}>
                    <Image
                      source={require('../assets/logo.jpg')}
                      style={{ width: 140, height: 140, borderRadius: 16, opacity: 0.92 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                {/* Text content */}
                <Animated.View
                  entering={nativeEntering(FadeInDown.delay(200).duration(700))}
                  style={{ paddingHorizontal: 36, paddingBottom: 80, width: '100%' }}
                >
                  <Text
                    style={{
                      fontFamily: 'CormorantGaramond_700Bold_Italic',
                      fontSize: 48,
                      color: '#F5F0E8',
                      lineHeight: 52,
                      marginBottom: 20,
                    }}
                  >
                    {slide.headline}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      fontSize: 15,
                      color: '#A89880',
                      lineHeight: 24,
                    }}
                  >
                    {slide.subtext}
                  </Text>
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'transparent' }}>
        <View style={{ paddingHorizontal: 36, paddingBottom: 16 }}>
          {/* Dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32, gap: 8 }}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeIndex ? 24 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === activeIndex ? '#C9A96E' : '#2A2A2A',
                }}
              />
            ))}
          </View>

          {/* CTA */}
          {activeIndex === slides.length - 1 ? (
            <Animated.View entering={nativeEntering(FadeIn.duration(400))}>
              <Pressable
                onPress={handleGetStarted}
                testID="get-started-button"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                })}
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
                  <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#0A0A0A', letterSpacing: 2 }}>
                    GET STARTED
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              onPress={handleNext}
              testID="next-button"
              style={({ pressed }) => ({
                height: 58,
                borderRadius: 29,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#2A2A2A',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#F5F0E8', letterSpacing: 1 }}>
                Continue
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
