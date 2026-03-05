import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import useTailoredStore, { GarmentPreferences } from '@/lib/state/tailored-store';

type OptionGroup<K extends keyof GarmentPreferences> = {
  key: K;
  label: string;
  options: { value: GarmentPreferences[K]; label: string }[];
};

const SLEEVE_OPTIONS: OptionGroup<'sleeveLength'> = {
  key: 'sleeveLength',
  label: 'SLEEVE LENGTH',
  options: [
    { value: 'any', label: 'Any' },
    { value: 'short', label: 'Short' },
    { value: 'long', label: 'Long' },
    { value: 'sleeveless', label: 'Sleeveless' },
  ],
};

const NECK_OPTIONS: OptionGroup<'neckStyle'> = {
  key: 'neckStyle',
  label: 'NECK STYLE',
  options: [
    { value: 'any', label: 'Any' },
    { value: 'round', label: 'Round Neck' },
    { value: 'v-neck', label: 'V-Neck' },
    { value: 'collar', label: 'Collar' },
    { value: 'turtleneck', label: 'Turtleneck' },
  ],
};

const TOP_FIT_OPTIONS: OptionGroup<'topFit'> = {
  key: 'topFit',
  label: 'TOP FIT',
  options: [
    { value: 'any', label: 'Any' },
    { value: 'slim', label: 'Slim Fit' },
    { value: 'regular', label: 'Regular' },
    { value: 'oversized', label: 'Oversized' },
  ],
};

const TROUSER_FIT_OPTIONS: OptionGroup<'trouserFit'> = {
  key: 'trouserFit',
  label: 'TROUSER FIT',
  options: [
    { value: 'any', label: 'Any' },
    { value: 'slim', label: 'Slim' },
    { value: 'straight', label: 'Straight' },
    { value: 'tapered', label: 'Tapered' },
    { value: 'baggy', label: 'Baggy' },
  ],
};

const TROUSER_LENGTH_OPTIONS: OptionGroup<'trouserLength'> = {
  key: 'trouserLength',
  label: 'TROUSER LENGTH',
  options: [
    { value: 'any', label: 'Any' },
    { value: 'full', label: 'Full Length' },
    { value: 'cropped', label: 'Cropped' },
    { value: 'shorts', label: 'Shorts' },
  ],
};

const DRESS_LENGTH_OPTIONS: OptionGroup<'dressLength'> = {
  key: 'dressLength',
  label: 'DRESS / SKIRT LENGTH',
  options: [
    { value: 'any', label: 'Any' },
    { value: 'mini', label: 'Mini' },
    { value: 'midi', label: 'Midi' },
    { value: 'maxi', label: 'Maxi' },
  ],
};

function ChipGroup<K extends keyof GarmentPreferences>({
  group,
  value,
  onChange,
}: {
  group: OptionGroup<K>;
  value: GarmentPreferences[K];
  onChange: (val: GarmentPreferences[K]) => void;
}) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
        {group.label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {group.options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => { Haptics.selectionAsync(); onChange(opt.value); }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: isActive ? '#C9A96E' : '#2A2A2A',
                backgroundColor: isActive ? 'rgba(201,169,110,0.12)' : '#161616',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              })}
            >
              {isActive ? <Check size={12} color="#C9A96E" strokeWidth={2.5} /> : null}
              <Text style={{
                fontFamily: isActive ? 'DMSans_500Medium' : 'DMSans_400Regular',
                fontSize: 13,
                color: isActive ? '#C9A96E' : '#A89880',
              }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function GarmentPreferencesScreen() {
  const router = useRouter();
  const garmentPreferences = useTailoredStore((s) => s.garmentPreferences);
  const setGarmentPreferences = useTailoredStore((s) => s.setGarmentPreferences);

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
              Garment Preferences
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880' }}>
              Used to guide your AI measurement analysis
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info banner */}
          <View style={{
            backgroundColor: 'rgba(201,169,110,0.07)',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(201,169,110,0.2)',
            padding: 14,
            marginBottom: 32,
          }}>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', lineHeight: 20 }}>
              These preferences are sent to the AI when you scan or import a photo — so measurements are tailored to the style of garment you actually want to wear.
            </Text>
          </View>

          {/* TOPS */}
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 22, color: '#F5F0E8', marginBottom: 20 }}>
            Tops & Shirts
          </Text>

          <ChipGroup
            group={SLEEVE_OPTIONS}
            value={garmentPreferences.sleeveLength}
            onChange={(v) => setGarmentPreferences({ sleeveLength: v })}
          />

          <ChipGroup
            group={NECK_OPTIONS}
            value={garmentPreferences.neckStyle}
            onChange={(v) => setGarmentPreferences({ neckStyle: v })}
          />

          <ChipGroup
            group={TOP_FIT_OPTIONS}
            value={garmentPreferences.topFit}
            onChange={(v) => setGarmentPreferences({ topFit: v })}
          />

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#2A2A2A', marginBottom: 28 }} />

          {/* BOTTOMS */}
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 22, color: '#F5F0E8', marginBottom: 20 }}>
            Trousers & Bottoms
          </Text>

          <ChipGroup
            group={TROUSER_FIT_OPTIONS}
            value={garmentPreferences.trouserFit}
            onChange={(v) => setGarmentPreferences({ trouserFit: v })}
          />

          <ChipGroup
            group={TROUSER_LENGTH_OPTIONS}
            value={garmentPreferences.trouserLength}
            onChange={(v) => setGarmentPreferences({ trouserLength: v })}
          />

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#2A2A2A', marginBottom: 28 }} />

          {/* DRESSES */}
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 22, color: '#F5F0E8', marginBottom: 20 }}>
            Dresses & Skirts
          </Text>

          <ChipGroup
            group={DRESS_LENGTH_OPTIONS}
            value={garmentPreferences.dressLength}
            onChange={(v) => setGarmentPreferences({ dressLength: v })}
          />

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#2A2A2A', marginBottom: 28 }} />

          {/* FREE TEXT */}
          <Text style={{ fontFamily: 'CormorantGaramond_700Bold_Italic', fontSize: 22, color: '#F5F0E8', marginBottom: 20 }}>
            Additional Details
          </Text>

          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            PREFERRED FABRICS
          </Text>
          <View style={{
            backgroundColor: '#161616',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#2A2A2A',
            paddingHorizontal: 16,
            marginBottom: 24,
          }}>
            <TextInput
              value={garmentPreferences.preferredFabric}
              onChangeText={(v) => setGarmentPreferences({ preferredFabric: v })}
              placeholder="e.g. cotton, linen, no synthetics"
              placeholderTextColor="#3A3A3A"
              style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 14,
                color: '#F5F0E8',
                paddingVertical: 16,
              }}
            />
          </View>

          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#A89880', letterSpacing: 2, marginBottom: 12 }}>
            ANYTHING ELSE
          </Text>
          <View style={{
            backgroundColor: '#161616',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#2A2A2A',
            paddingHorizontal: 16,
            marginBottom: 8,
          }}>
            <TextInput
              value={garmentPreferences.additionalNotes}
              onChangeText={(v) => setGarmentPreferences({ additionalNotes: v })}
              placeholder="e.g. I prefer relaxed fits, need room in the shoulders..."
              placeholderTextColor="#3A3A3A"
              multiline
              numberOfLines={3}
              style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 14,
                color: '#F5F0E8',
                paddingVertical: 16,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#3A3A3A', marginTop: 4 }}>
            All preferences are saved automatically as you select them.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
