import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Chrome as Home, Calendar, User, Bell, BookOpen, Compass, Briefcase, Award, Sparkles } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/sign-in');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  const isParent = user.role === 'parent';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...(isParent && {
            pointerEvents: 'none',
          }),
        },
        tabBarLabelStyle: {
          display: 'none',
        },
        tabBarIcon: () => null,
        headerShown: false,
      }}
    >
      {!isParent ? (
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      ) : (
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
      )}
      
      {!isParent ? (
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Compass size={size} color={color} />
          ),
        }}
      />
      ) : (
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      )}
      
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      
      {!isParent ? (
      <Tabs.Screen
        name="exams"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      ) : (
        <Tabs.Screen
          name="exams"
          options={{
            href: null,
          }}
        />
      )}
      
      {!isParent ? (
      <Tabs.Screen
        name="placements"
        options={{
          title: 'Placements',
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      ) : (
        <Tabs.Screen
          name="placements"
          options={{
            href: null,
          }}
        />
      )}
      
      <Tabs.Screen
        name="meditation"
        options={{
          title: 'Meditate',
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color, size }) => (
            <Award size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

