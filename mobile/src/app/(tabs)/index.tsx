import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { nativeEntering } from '@/lib/entering';
import useTailoredStore from '@/lib/state/tailored-store';
import { Bell } from 'lucide-react-native';
import { ClothingItem } from '@/lib/state/tailored-store';

function fitScoreColor(score: number): string {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#F44336';
}

function FitBadge({ score }: { score: number }) {
  const color = fitScoreColor(score);
  return (
    <View style={{
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: `${color}22`,
      borderWidth: 1,
      borderColor: `${color}55`,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    }}>
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 11, color }}>
        {score}% fit
      </Text>
    </View>
  );
}

function ClothingCard({ item, onPress }: { item: ClothingItem; onPress: () => void }) {
  const emojiMap: Record<string, string> = {
    shirt: '👔',
    pants: '👖',
    jacket: '🧥',
    top: '👕',
  };
  return (
    <Pressable
      onPress={onPress}
      testID={`clothing-card-${item.id}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        width: 140,
        marginRight: 12,
      })}
    >
      <LinearGradient
        colors={['#1E1E1E', '#161616']}
        style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 10, height: 170 }}
      >
        <LinearGradient
          colors={['#2A2A2A', '#1E1E1E']}
          style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 40 }}>
            {emojiMap[item.category] ?? '👕'}
          </Text>
        </LinearGradient>
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <FitBadge score={item.fitScore} />
        </View>
      </LinearGradient>
      <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#F5F0E8', marginBottom: 2 }} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880' }}>
        {item.brand}
      </Text>
    </Pressable>
  );
}

function RecommendedCard({ item, onPress }: { item: ClothingItem; onPress: () => void }) {
  const emojiMap: Record<string, string> = {
    shirt: '👔',
    pants: '👖',
    jacket: '🧥',
    top: '👕',
  };
  return (
    <Pressable
      onPress={onPress}
      testID={`recommended-card-${item.id}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        flex: 1,
        marginBottom: 16,
      })}
    >
      <LinearGradient
        colors={['#1E1E1E', '#161616']}
        style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 10 }}
      >
        <LinearGradient
          colors={['#2A2A2A', '#1a1a1a']}
          style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 44 }}>
            {emojiMap[item.category] ?? '👕'}
          </Text>
        </LinearGradient>
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <FitBadge score={item.fitScore} />
        </View>
      </LinearGradient>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#A89880', marginBottom: 2 }}>
        {item.brand}
      </Text>
      <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#F5F0E8', marginBottom: 4 }} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#C9A96E' }}>
        {item.price}
      </Text>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const userName = useTailoredStore((s) => s.userName);
  const savedItems = useTailoredStore((s) => s.savedItems);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleItemPress = (item: ClothingItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/fit-analysis', params: { itemId: item.id } });
  };

  const avgScore = Math.round(savedItems.reduce((sum, i) => sum + i.fitScore, 0) / savedItems.length);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} testID="discover-screen">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}>
            <View>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#A89880', letterSpacing: 0.5, marginBottom: 2 }}>
                {greeting}
              </Text>
              <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: '#F5F0E8' }}>
                {userName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable
                testID="notifications-button"
                style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#161616', borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' }}
              >
                <Bell size={18} color="#A89880" strokeWidth={1.5} />
              </Pressable>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#C9A96E', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#0A0A0A' }}>
                  {userName.charAt(0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Fit Score Card */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(100).duration(600))} style={{ paddingHorizontal: 24, marginBottom: 32 }}>
            <LinearGradient
              colors={['#1a1208', '#1E1A10', '#161616']}
              style={{ borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(201,169,110,0.2)' }}
            >
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: '#C9A96E', letterSpacing: 2, marginBottom: 12 }}>
                YOUR FIT SCORE
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 }}>
                <Text style={{ fontFamily: 'CormorantGaramond_700Bold', fontSize: 60, color: '#C9A96E', lineHeight: 64 }}>
                  {avgScore}
                </Text>
                <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 28, color: '#A89880', marginBottom: 8, marginLeft: 4 }}>
                  %
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#C9A96E', marginBottom: 10, marginLeft: 8 }}>
                  Match
                </Text>
              </View>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#A89880', lineHeight: 20 }}>
                Your wardrobe is well-fitted for your body type.{' '}
                {savedItems.filter(i => i.fitScore >= 80).length} of {savedItems.length} items score above 80%.
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Recent Tries */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(200).duration(600))} style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 16 }}>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 18, color: '#F5F0E8' }}>
                Recent Tries
              </Text>
              <Pressable testID="see-all-recent">
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#C9A96E' }}>
                  See all
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
              style={{ flexGrow: 0 }}
            >
              {savedItems.slice(0, 4).map((item) => (
                <ClothingCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
              ))}
            </ScrollView>
          </Animated.View>

          {/* Recommended For You */}
          <Animated.View entering={nativeEntering(FadeInDown.delay(300).duration(600))} style={{ paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 18, color: '#F5F0E8' }}>
                Recommended
              </Text>
              <Pressable testID="see-all-recommended">
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#C9A96E' }}>
                  See all
                </Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                {savedItems.filter((_, i) => i % 2 === 0).map((item) => (
                  <RecommendedCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {savedItems.filter((_, i) => i % 2 !== 0).map((item) => (
                  <RecommendedCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
