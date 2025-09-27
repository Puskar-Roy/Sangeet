import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import CustomTabBar from '../components/Home/CustomTabBar';
import { Heart, User, Home, Search, Music } from 'lucide-react-native';
import SearchScreen from '../screens/Search/SearchScreen';
import PlayerScreen from '../screens/Player/PlayerScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Home color={focused ? '#6156e2' : '#8e8e8e'} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Search color={focused ? '#6156e2' : '#8e8e8e'} />
          ),
        }}
      />
      <Tab.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Music color={focused ? '#6156e2' : '#8e8e8e'} />
          ),
        }}
      />
      <Tab.Screen
        name="Faves"
        component={() => null}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Heart color={focused ? '#6156e2' : '#8e8e8e'} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={() => null}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <User color={focused ? '#6156e2' : '#8e8e8e'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
