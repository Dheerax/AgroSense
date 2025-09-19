import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import DashboardScreen from '../screens/DashboardScreen';
import MarketScreen from '../screens/MarketScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import IrrigationControlScreen from '../screens/IrrigationControlScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AgricultureChatScreen from '../screens/AgricultureChatScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, size }: { name: string; color: string; size: number }) => (
  <Icon name={name} size={size} color={color} />
);

const TabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 32,
            }}>
              <TabIcon name="view-dashboard" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 32,
            }}>
              <TabIcon name="chart-line" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 32,
            }}>
              <TabIcon name="google-analytics" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AI Chat"
        component={AgricultureChatScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 32,
            }}>
              <TabIcon name="robot" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Irrigation"
        component={IrrigationControlScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 32,
            }}>
              <TabIcon name="water" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 32,
            }}>
              <TabIcon name="account" color={color} size={size} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
