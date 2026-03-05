import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';
import useTailoredStore from '@/lib/state/tailored-store';

type Unit = 'cm' | 'in';
type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';

function detectBodyType(chest: number, waist: number, hips: number): BodyType {
  if (chest === 0 || waist === 0 || hips === 0) return 'mesomorph';
  const shoulderToWaist = chest / waist;
  const waistToHip = waist / hips;
  if (shoulderToWaist > 1.15) return 'mesomorph';
  if (waistToHip > 0.9) return 'endomorph';
  return 'ectomorph';
}

function BodyGuideCard() {
  return (
    <View
      style={{
        backgroundColor: '#161616',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        padding: 20,
        marginBottom: 28,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 10, color: '#A89880', letterSpacing: 2, marginBottom: 16 }}>
        MEASUREMENT GUIDE
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {/* Silhouette */}
        <View style={{ alignItems: 'center' }}>
          {/* Head */}
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(201,169,110,0.4)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.6)', marginBottom: 3 }} />
          {/* Neck */}
          <View style={{ width: 12, height: 8, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(201,169,110,0.4)' }} />
          {/* Shoulders */}
          <View style={{ width: 72, height: 12, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(201,169,110,0.4)' }} />
          {/* Chest marker */}
          <View style={{ width: 52, height: 22, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(201,169,110,0.4)', position: 'relative' }}>
            <View style={{ position: 'absolute', left: -14, top: 6, width: 10, height: 1, backgroundColor: '#C9A96E', opacity: 0.8 }} />
            <View style={{ position: 'absolute', right: -14, top: 6, width: 10, height: 1, backgroundColor: '#C9A96E', opacity: 0.8 }} />
          </View>
          {/* Waist marker */}
          <View style={{ width: 40, height: 22, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(201,169,110,0.4)', position: 'relative' }}>
            <View style={{ position: 'absolute', left: -18, top: 6, width: 14, height: 1, backgroundColor: '#A89880', opacity: 0.8 }} />
            <View style={{ position: 'absolute', right: -18, top: 6, width: 14, height: 1, backgroundColor: '#A89880', opacity: 0.8 }} />
          </View>
          {/* Hips marker */}
          <View style={{ width: 60, height: 16, borderRadius: 4, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.4)', position: 'relative' }}>
            <View style={{ position: 'absolute', left: -10, top: 4, width: 6, height: 1, backgroundColor: '#C9A96E', opacity: 0.6 }} />
            <View style={{ position: 'absolute', right: -10, top: 4, width: 6, height: 1, backgroundColor: '#C9A96E', opacity: 0.6 }} />
          </View>
          {/* Legs */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ width: 22, height: 54, borderRadius: 6, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.4)' }} />
            <View style={{ width: 22, height: 54, borderRadius: 6, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(201,169,110,0.4)' }} />
          </View>
        </View>
        {/* Labels */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#C9A96E' }} />
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880' }}>Chest</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#A89880' }} />
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880' }}>Waist</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(201,169,110,0.6)' }} />
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880' }}>Hips</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(245,240,232,0.3)' }} />
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880' }}>Shoulder width</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(245,240,232,0.3)' }} />
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880' }}>Inseam</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

interface MeasurementFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  hint: string;
  unit: Unit;
  testID: string;
}

function MeasurementField({ label, value, onChangeText, hint, unit, testID }: MeasurementFieldProps) {
  const [focused, setFocused] = useState<boolean>(false);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 10, color: '#A89880', letterSpacing: 2, marginBottom: 8 }}>
        {label} ({unit})
      </Text>
      <View
        style={{
          backgroundColor: '#161616',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: focused ? '#C9A96E' : '#2A2A2A',
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 10,
        }}
      >
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={unit === 'cm' ? '0' : '0'}
          placeholderTextColor="#3A3A3A"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            fontFamily: 'DMSans_400Regular',
            fontSize: 18,
            color: '#F5F0E8',
            paddingVertical: 0,
          }}
        />
      </View>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#3A3A3A', marginTop: 5, lineHeight: 16 }}>
        {hint}
      </Text>
    </View>
  );
}

export default function MeasurementsEditScreen() {
  const router = useRouter();
  const measurements = useTailoredStore((s) => s.measurements);
  const setProfile = useTailoredStore((s) => s.setProfile);

  const [unit, setUnit] = useState<Unit>('cm');

  const cmToDisplay = (cm: number): string => {
    if (cm === 0) return '';
    if (unit === 'in') return (cm / 2.54).toFixed(1);
    return cm.toString();
  };

  const [chest, setChest] = useState<string>(cmToDisplay(measurements.chest));
  const [waist, setWaist] = useState<string>(cmToDisplay(measurements.waist));
  const [hips, setHips] = useState<string>(cmToDisplay(measurements.hips));
  const [shoulder, setShoulder] = useState<string>(cmToDisplay(measurements.shoulder));
  const [inseam, setInseam] = useState<string>(cmToDisplay(measurements.inseam));

  const handleUnitChange = (newUnit: Unit) => {
    if (newUnit === unit) return;
    Haptics.selectionAsync();
    // Convert existing values
    const convert = (val: string): string => {
      const n = parseFloat(val);
      if (!val || isNaN(n)) return '';
      if (newUnit === 'in') return (n / 2.54).toFixed(1);
      return (n * 2.54).toFixed(1);
    };
    setChest(convert(chest));
    setWaist(convert(waist));
    setHips(convert(hips));
    setShoulder(convert(shoulder));
    setInseam(convert(inseam));
    setUnit(newUnit);
  };

  const toCm = (val: string): number => {
    const n = parseFloat(val);
    if (!val || isNaN(n)) return 0;
    return unit === 'in' ? parseFloat((n * 2.54).toFixed(1)) : n;
  };

  const handleSave = () => {
    const chestCm = toCm(chest);
    const waistCm = toCm(waist);
    const hipsCm = toCm(hips);
    const shoulderCm = toCm(shoulder);
    const inseamCm = toCm(inseam);

    const bodyType = detectBodyType(chestCm, waistCm, hipsCm);

    setProfile({
      measurements: {
        chest: chestCm,
        waist: waistCm,
        hips: hipsCm,
        shoulder: shoulderCm,
        inseam: inseamCm,
      },
      bodyType,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="measurements-edit-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Pressable
                testID="back-button"
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#161616',
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                })}
              >
                <ChevronLeft size={18} color="#F5F0E8" strokeWidth={1.5} />
              </Pressable>
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: '#C9A96E', letterSpacing: 3 }}>
                TAILORED
              </Text>
            </View>
            <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 38, color: '#F5F0E8', lineHeight: 44 }}>
              Edit Measurements
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Body guide visual */}
            <BodyGuideCard />

            {/* Unit toggle */}
            <View style={{ flexDirection: 'row', backgroundColor: '#161616', borderRadius: 10, padding: 4, marginBottom: 28, alignSelf: 'flex-start' }}>
              {(['cm', 'in'] as Unit[]).map((u) => (
                <Pressable
                  key={u}
                  testID={`unit-${u}`}
                  onPress={() => handleUnitChange(u)}
                  style={{
                    paddingHorizontal: 22,
                    paddingVertical: 9,
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

            {/* Fields */}
            <MeasurementField
              label="CHEST"
              value={chest}
              onChangeText={setChest}
              hint="Measure around the fullest part of your chest"
              unit={unit}
              testID="chest-input"
            />
            <MeasurementField
              label="WAIST"
              value={waist}
              onChangeText={setWaist}
              hint="Measure around the narrowest part of your torso"
              unit={unit}
              testID="waist-input"
            />
            <MeasurementField
              label="HIPS"
              value={hips}
              onChangeText={setHips}
              hint="Measure around the fullest part of your hips"
              unit={unit}
              testID="hips-input"
            />
            <MeasurementField
              label="SHOULDER WIDTH"
              value={shoulder}
              onChangeText={setShoulder}
              hint="Measure from shoulder tip to shoulder tip"
              unit={unit}
              testID="shoulder-input"
            />
            <MeasurementField
              label="INSEAM"
              value={inseam}
              onChangeText={setInseam}
              hint="Measure from crotch to ankle"
              unit={unit}
              testID="inseam-input"
            />

            {/* Save button */}
            <Pressable
              testID="save-measurements-button"
              onPress={handleSave}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginTop: 8 })}
            >
              <LinearGradient
                colors={['#C9A96E', '#A07840']}
                style={{ height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#0A0A0A', letterSpacing: 1.5 }}>
                  SAVE MEASUREMENTS
                </Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
