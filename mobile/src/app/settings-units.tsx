import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import useTailoredStore from '@/lib/state/tailored-store';

type UnitSystem = 'cm' | 'in';

const UNIT_OPTIONS: { value: UnitSystem; label: string; description: string; example: string }[] = [
  {
    value: 'cm',
    label: 'Centimetres (cm)',
    description: 'Used in most countries worldwide',
    example: 'e.g. Chest: 96 cm, Waist: 78 cm',
  },
  {
    value: 'in',
    label: 'Inches (in)',
    description: 'Used in the United States and UK',
    example: 'e.g. Chest: 38", Waist: 31"',
  },
];

export default function SettingsUnitsScreen() {
  const router = useRouter();
  const unit = useTailoredStore((s) => s.unit ?? 'cm');
  const setUnit = useTailoredStore((s) => s.setUnit);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: '#161616',
              borderWidth: 1, borderColor: '#2A2A2A',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 14,
            })}
          >
            <ChevronLeft size={18} color="#F5F0E8" strokeWidth={1.5} />
          </Pressable>
          <View>
            <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 28, color: '#F5F0E8' }}>
              Units
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
              Choose how measurements are displayed
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            MEASUREMENT SYSTEM
          </Text>
          <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', marginBottom: 28 }}>
            {UNIT_OPTIONS.map((option, index) => {
              const isSelected = unit === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setUnit(option.value);
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    flexDirection: 'row', alignItems: 'center',
                    padding: 18,
                    borderBottomWidth: index < UNIT_OPTIONS.length - 1 ? 1 : 0,
                    borderBottomColor: '#2A2A2A',
                    backgroundColor: isSelected ? 'rgba(201,169,110,0.05)' : 'transparent',
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: isSelected ? '#C9A96E' : '#F5F0E8', marginBottom: 3 }}>
                      {option.label}
                    </Text>
                    <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', marginBottom: 2 }}>
                      {option.description}
                    </Text>
                    <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#555', fontStyle: 'italic' }}>
                      {option.example}
                    </Text>
                  </View>
                  {isSelected ? (
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(201,169,110,0.15)', borderWidth: 1, borderColor: '#C9A96E', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={13} color="#C9A96E" strokeWidth={2.5} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* Conversion reference */}
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            QUICK REFERENCE
          </Text>
          <View style={{ backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' }}>
            {[
              { cm: '86 cm', inches: '34"', label: 'Chest S' },
              { cm: '96 cm', inches: '38"', label: 'Chest M' },
              { cm: '106 cm', inches: '42"', label: 'Chest L' },
              { cm: '78 cm', inches: '31"', label: 'Waist M' },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 18, paddingVertical: 13,
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: '#2A2A2A',
                }}
              >
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', flex: 1 }}>{row.label}</Text>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#F5F0E8', width: 70, textAlign: 'right' }}>{row.cm}</Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#555', marginHorizontal: 10 }}>=</Text>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#F5F0E8', width: 50, textAlign: 'right' }}>{row.inches}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
