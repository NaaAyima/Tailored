import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Shirt, SlidersHorizontal, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#C9A96E',
        tabBarInactiveTintColor: '#A89880',
        tabBarLabelStyle: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 11,
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home size={size - 2} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="tryon"
        options={{
          title: 'Try On',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Shirt size={size - 2} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          title: 'Preferences',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <SlidersHorizontal size={size - 2} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User size={size - 2} color={color} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
