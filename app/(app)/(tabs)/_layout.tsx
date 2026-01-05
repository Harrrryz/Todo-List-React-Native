import { Tabs } from 'expo-router';
import React from 'react';

import { TodoRefreshProvider } from '@/components/TodoRefreshContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <TodoRefreshProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={Colors[colorScheme ?? 'light'].tint} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => <AntDesign name="calendar" size={24} color={Colors[colorScheme ?? 'light'].tint} />,
          }}
        />
        <Tabs.Screen
          name="ai-chat"
          options={{
            title: 'AI Chat',
            tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses" size={24} color={Colors[colorScheme ?? 'light'].tint} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={Colors[colorScheme ?? 'light'].tint} />,
          }}
        />
      </Tabs>
    </TodoRefreshProvider>
  );
}
