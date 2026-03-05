import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import useTailoredStore from '@/lib/state/tailored-store';
import { Check } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Gender = 'Men' | 'Women' | 'Non-binary';
type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';
type Unit = 'cm' | 'in';

function detectBodyType(chest: number, waist: number, hips: number): BodyType {
  if (chest === 0 || waist === 0 || hips === 0) return 'mesomorph';
  const shoulderToWaist = chest / waist;
  const waistToHip = waist / hips;
  if (shoulderToWaist > 1.15) return 'mesomorph';
  if (waistToHip > 0.9) return 'endomorph';
  return 'ectomorph';
}

const bodyTypeInfo = {
  ectomorph: {
    label: 'Ectomorph',
    description: 'Lean and long build with fast metabolism. Fitted cuts and layered looks work beautifully for your frame.',
    traits: ['Slim frame', 'Narrow shoulders', 'Long limbs'],
  },
  mesomorph: {
    label: 'Mesomorph',
    description: 'Athletic and well-proportioned. Most cuts suit your frame — focus on accentuating your V-taper.',
    traits: ['Athletic build', 'Defined shoulders', 'Proportional frame'],
  },
  endomorph: {
    label: 'Endomorph',
    description: 'Softer, rounder silhouette. Structured fabrics and vertical lines create a polished, elongated look.',
    traits: ['Fuller figure', 'Broader frame', 'Strong build'],
  },
};

export default function ProfileSetupScreen() {
  const router = useRouter();
  const setProfile = useTailoredStore((s) => s.setProfile);

  const [step, setStep] = useState<number>(0);
  const [height, setHeight] = useState<string>('175');
  const [weight, setWeight] = useState<string>('70');
  const [gender, setGender] = useState<Gender | null>(null);
  const [unit, setUnit] = useState<Unit>('cm');
  const [chest, setChest] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [hips, setHips] = useState<string>('');
  const [done, setDone] = useState<boolean>(false);

  const detectedBodyType: BodyType = detectBodyType(
    parseFloat(chest) || 0,
    parseFloat(waist) || 0,
    parseFloat(hips) || 0
  );

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Save and complete
      setProfile({
        height: parseFloat(height) || 175,
        weight: parseFloat(weight) || 70,
        bodyType: detectedBodyType,
        measurements: {
          chest: parseFloat(chest) || 0,
          waist: parseFloat(waist) || 0,
          hips: parseFloat(hips) || 0,
        },
        hasCompletedProfile: true,
      });
      setDone(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1800);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) setStep(step - 1);
  };

  const canProceed = step === 0
    ? height.length > 0 && gender !== null
    : step === 1
    ? chest.length > 0 && waist.length > 0 && hips.length > 0
    : true;

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View entering={nativeEntering(FadeInDown.duration(600))} style={{ alignItems: 'center' }}>
          <LinearGradient
            colors={['#C9A96E', '#A07840']}
            style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
          >
            <Check size={40} color="#0A0A0A" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 32, color: '#F5F0E8', marginBottom: 10 }}>
            Fit Profile Created
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880' }}>
            Preparing your experience...
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              {step > 0 ? (
                <Pressable onPress={handleBack} testID="back-button">
                  <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', letterSpacing: 0.5 }}>
                    ← Back
                  </Text>
                </Pressable>
              ) : (
                <View />
              )}
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#C9A96E', letterSpacing: 3 }}>
                TAILORED
              </Text>
              <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 12, color: '#A89880' }}>
                {step + 1} / 3
              </Text>
            </View>

            {/* Progress bar */}
            <View style={{ height: 2, backgroundColor: '#2A2A2A', borderRadius: 1 }}>
              <View
                style={{
                  height: 2,
                  backgroundColor: '#C9A96E',
                  borderRadius: 1,
                  width: `${((step + 1) / 3) * 100}%`,
                }}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {step === 0 && (
              <Animated.View entering={nativeEntering(FadeInRight.duration(400))}>
                <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 38, color: '#F5F0E8', marginBottom: 8 }}>
                  Your Stats
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880', marginBottom: 36, lineHeight: 22 }}>
                  Basic information helps us calibrate your fit profile.
                </Text>

                {/* Gender */}
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
                  GENDER
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
                  {(['Men', 'Women', 'Non-binary'] as Gender[]).map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => { setGender(g); Haptics.selectionAsync(); }}
                      testID={`gender-${g.toLowerCase()}`}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: gender === g ? '#C9A96E' : '#2A2A2A',
                        backgroundColor: gender === g ? 'rgba(201,169,110,0.1)' : '#161616',
                      }}
                    >
                      <Text style={{
                        fontFamily: gender === g ? 'DMSans_500Medium' : 'DMSans_400Regular',
                        fontSize: 13,
                        color: gender === g ? '#C9A96E' : '#A89880',
                      }}>
                        {g}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Height */}
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
                  HEIGHT (cm)
                </Text>
                <View style={{
                  backgroundColor: '#161616',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  paddingHorizontal: 18,
                  marginBottom: 24,
                }}>
                  <TextInput
                    testID="height-input"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    placeholder="175"
                    placeholderTextColor="#3A3A3A"
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      fontSize: 18,
                      color: '#F5F0E8',
                      paddingVertical: 18,
                    }}
                  />
                </View>

                {/* Weight */}
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
                  WEIGHT (kg) — Optional
                </Text>
                <View style={{
                  backgroundColor: '#161616',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  paddingHorizontal: 18,
                  marginBottom: 8,
                }}>
                  <TextInput
                    testID="weight-input"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="70"
                    placeholderTextColor="#3A3A3A"
                    style={{
                      fontFamily: 'DMSans_400Regular',
                      fontSize: 18,
                      color: '#F5F0E8',
                      paddingVertical: 18,
                    }}
                  />
                </View>
              </Animated.View>
            )}

            {step === 1 && (
              <Animated.View entering={nativeEntering(FadeInRight.duration(400))}>
                <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 38, color: '#F5F0E8', marginBottom: 8 }}>
                  Measurements
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880', marginBottom: 24, lineHeight: 22 }}>
                  Precise measurements unlock accurate fit predictions.
                </Text>

                {/* Unit toggle */}
                <View style={{ flexDirection: 'row', backgroundColor: '#161616', borderRadius: 10, padding: 4, marginBottom: 32, alignSelf: 'flex-start' }}>
                  {(['cm', 'in'] as Unit[]).map((u) => (
                    <Pressable
                      key={u}
                      onPress={() => setUnit(u)}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: unit === u ? '#C9A96E' : 'transparent',
                      }}
                    >
                      <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: unit === u ? '#0A0A0A' : '#A89880' }}>
                        {u}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Scan Instead */}
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/body-scan'); }}
                  testID="scan-instead-button"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    marginBottom: 28,
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(201,169,110,0.3)',
                    backgroundColor: 'rgba(201,169,110,0.06)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#C9A96E', flex: 1, lineHeight: 18 }}>
                    Or use your camera to auto-detect measurements →
                  </Text>
                </Pressable>

                {[
                  { label: 'CHEST', value: chest, setter: setChest, id: 'chest', placeholder: unit === 'cm' ? '95' : '37' },
                  { label: 'WAIST', value: waist, setter: setWaist, id: 'waist', placeholder: unit === 'cm' ? '80' : '31' },
                  { label: 'HIPS', value: hips, setter: setHips, id: 'hips', placeholder: unit === 'cm' ? '98' : '38' },
                ].map((field) => (
                  <View key={field.id} style={{ marginBottom: 20 }}>
                    <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
                      {field.label} ({unit})
                    </Text>
                    <View style={{
                      backgroundColor: '#161616',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#2A2A2A',
                      paddingHorizontal: 18,
                    }}>
                      <TextInput
                        testID={`${field.id}-input`}
                        value={field.value}
                        onChangeText={field.setter}
                        keyboardType="numeric"
                        placeholder={field.placeholder}
                        placeholderTextColor="#3A3A3A"
                        style={{
                          fontFamily: 'DMSans_400Regular',
                          fontSize: 18,
                          color: '#F5F0E8',
                          paddingVertical: 18,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}

            {step === 2 && (
              <Animated.View entering={nativeEntering(FadeInRight.duration(400))}>
                <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 38, color: '#F5F0E8', marginBottom: 8 }}>
                  Your Body Type
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880', marginBottom: 36, lineHeight: 22 }}>
                  Based on your measurements, we've identified your body type.
                </Text>

                {/* Body silhouette */}
                <View style={{ alignItems: 'center', marginBottom: 36 }}>
                  <LinearGradient
                    colors={['#1E1E1E', '#2A2A2A']}
                    style={{
                      width: 140,
                      height: 220,
                      borderRadius: 70,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#C9A96E',
                    }}
                  >
                    <View style={{ alignItems: 'center' }}>
                      {/* Head */}
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#C9A96E', opacity: 0.6, marginBottom: 6 }} />
                      {/* Shoulders */}
                      <View style={{ width: 80, height: 16, borderRadius: 8, backgroundColor: '#C9A96E', opacity: 0.4, marginBottom: 4 }} />
                      {/* Torso */}
                      <View style={{ width: 56, height: 50, borderRadius: 6, backgroundColor: '#C9A96E', opacity: 0.3, marginBottom: 4 }} />
                      {/* Hips */}
                      <View style={{ width: 72, height: 20, borderRadius: 8, backgroundColor: '#C9A96E', opacity: 0.35, marginBottom: 4 }} />
                      {/* Legs */}
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <View style={{ width: 26, height: 52, borderRadius: 6, backgroundColor: '#C9A96E', opacity: 0.25 }} />
                        <View style={{ width: 26, height: 52, borderRadius: 6, backgroundColor: '#C9A96E', opacity: 0.25 }} />
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Body type card */}
                <View style={{ backgroundColor: '#161616', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#C9A96E', marginBottom: 24 }}>
                  <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 28, color: '#C9A96E', marginBottom: 8 }}>
                    {bodyTypeInfo[detectedBodyType].label}
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#A89880', lineHeight: 22, marginBottom: 20 }}>
                    {bodyTypeInfo[detectedBodyType].description}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {bodyTypeInfo[detectedBodyType].traits.map((trait) => (
                      <View key={trait} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)' }}>
                        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#C9A96E' }}>{trait}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* CTA */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 }}>
            <Pressable
              onPress={handleNext}
              disabled={!canProceed}
              testID="next-step-button"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : canProceed ? 1 : 0.4 })}
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
                  {step === 2 ? 'CREATE FIT PROFILE' : 'CONTINUE'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
