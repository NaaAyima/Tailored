import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import useTailoredStore from '@/lib/state/tailored-store';
import { X, Check, AlertCircle, Minus } from 'lucide-react-native';

function fitScoreColor(score: number): string {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#F44336';
}

type FitStatus = 'good' | 'moderate' | 'poor';

interface AnalysisCard {
  label: string;
  status: FitStatus;
  detail: string;
}

function StatusIcon({ status }: { status: FitStatus }) {
  if (status === 'good') return <Check size={14} color="#4CAF50" strokeWidth={2.5} />;
  if (status === 'moderate') return <Minus size={14} color="#FF9800" strokeWidth={2.5} />;
  return <AlertCircle size={14} color="#F44336" strokeWidth={2.5} />;
}

function statusColor(status: FitStatus): string {
  if (status === 'good') return '#4CAF50';
  if (status === 'moderate') return '#FF9800';
  return '#F44336';
}

function AnimatedScoreCircle({ score }: { score: number }) {
  const animValue = useRef(new RNAnimated.Value(0)).current;
  const color = fitScoreColor(score);

  useEffect(() => {
    RNAnimated.timing(animValue, {
      toValue: score,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [score]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 140, height: 140 }}>
      {/* Background circle */}
      <View style={{
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 8,
        borderColor: '#2A2A2A',
        position: 'absolute',
      }} />
      {/* Colored arc approximation using gradient */}
      <View style={{
        width: 124,
        height: 124,
        borderRadius: 62,
        borderWidth: 8,
        borderColor: 'transparent',
        borderTopColor: color,
        borderRightColor: score > 25 ? color : 'transparent',
        borderBottomColor: score > 50 ? color : 'transparent',
        borderLeftColor: score > 75 ? color : 'transparent',
        position: 'absolute',
        transform: [{ rotate: '-45deg' }],
      }} />
      {/* Score text */}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 42, color, lineHeight: 46 }}>
          {score}
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880', letterSpacing: 1 }}>
          FIT SCORE
        </Text>
      </View>
    </View>
  );
}

export default function FitAnalysisScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const savedItems = useTailoredStore((s) => s.savedItems);

  const item = savedItems.find((i) => i.id === itemId) ?? savedItems[0];

  const emojiMap: Record<string, string> = {
    shirt: '👔',
    pants: '👖',
    jacket: '🧥',
    top: '👕',
  };

  const analysisCards: AnalysisCard[] = [
    {
      label: 'Shoulders',
      status: item.fitScore >= 80 ? 'good' : item.fitScore >= 60 ? 'moderate' : 'poor',
      detail: item.fitScore >= 80 ? 'Perfect alignment' : item.fitScore >= 60 ? 'Slight tension' : 'Too narrow',
    },
    {
      label: 'Waist',
      status: item.fitScore >= 70 ? 'good' : 'moderate',
      detail: item.fitScore >= 70 ? 'Clean fit' : 'Minor bunching',
    },
    {
      label: 'Length',
      status: item.fitScore >= 75 ? 'good' : item.fitScore >= 55 ? 'moderate' : 'poor',
      detail: item.fitScore >= 75 ? 'Ideal proportion' : item.fitScore >= 55 ? 'Slightly short' : 'Too short',
    },
  ];

  const aiAdvice = item.fitScore >= 80
    ? `The cut accentuates your shoulder-to-waist ratio beautifully. Fabric weight is well-suited to your frame. This is an excellent addition to your wardrobe.`
    : item.fitScore >= 60
    ? `The slim cut works well through the torso. However, the inseam may run slightly short for your proportions. Consider requesting a longer length or sizing up for more ease through the shoulders.`
    : `The proportions of this garment are not ideally matched to your frame. The shoulder seams sit too narrow, creating tension. We recommend exploring a size up or a different cut altogether.`;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="fit-analysis-screen">
      <SafeAreaView style={{ flex: 1 }}>
        {/* Close button */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            testID="close-button"
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="#A89880" strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Item visual */}
          <Animated.View entering={FadeInDown.delay(50).duration(500)}>
            <LinearGradient
              colors={['#1E1E1E', '#161616']}
              style={{ marginHorizontal: 24, borderRadius: 20, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
            >
              <Text style={{ fontSize: 80 }}>
                {emojiMap[item.category] ?? '👕'}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Item name */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ paddingHorizontal: 24, marginBottom: 28 }}>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', marginBottom: 4, letterSpacing: 0.5 }}>
              {item.brand.toUpperCase()} · {item.price}
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 28, color: '#F5F0E8', lineHeight: 32 }}>
              {item.name}
            </Text>
          </Animated.View>

          {/* Score circle */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ alignItems: 'center', marginBottom: 32 }}>
            <AnimatedScoreCircle score={item.fitScore} />
          </Animated.View>

          {/* Analysis cards */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 14 }}>
              FIT BREAKDOWN
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {analysisCards.map((card) => (
                <View
                  key={card.label}
                  style={{
                    flex: 1,
                    backgroundColor: '#161616',
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: `${statusColor(card.status)}33`,
                    alignItems: 'center',
                  }}
                >
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: `${statusColor(card.status)}18`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                    <StatusIcon status={card.status} />
                  </View>
                  <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#F5F0E8', marginBottom: 4, textAlign: 'center' }}>
                    {card.label}
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 10, color: '#A89880', textAlign: 'center' }}>
                    {card.detail}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* AI Recommendation */}
          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={{ paddingHorizontal: 24, marginBottom: 28 }}>
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 14 }}>
              AI RECOMMENDATION
            </Text>
            <LinearGradient
              colors={['#1a1208', '#161616']}
              style={{ borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(201,169,110,0.2)' }}
            >
              <Text style={{
                fontFamily: 'CormorantGaramond_400Regular_Italic',
                fontSize: 17,
                color: '#F5F0E8',
                lineHeight: 26,
              }}>
                "{aiAdvice}"
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* CTAs */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ paddingHorizontal: 24, gap: 12 }}>
            <Pressable
              testID="find-alternatives-button"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                height: 54,
                borderRadius: 27,
                borderWidth: 1,
                borderColor: '#2A2A2A',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#161616',
              })}
            >
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#F5F0E8', letterSpacing: 0.5 }}>
                Find Better Alternatives
              </Text>
            </Pressable>

            <Pressable
              testID="add-to-wardrobe-button"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <LinearGradient
                colors={['#C9A96E', '#A07840']}
                style={{
                  height: 54,
                  borderRadius: 27,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 14, color: '#0A0A0A', letterSpacing: 1 }}>
                  ADD TO WARDROBE
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
