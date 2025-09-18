// AppNavigator.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import HomeStack from './HomeStack'; // <-- adjust path as needed

const Tab = createBottomTabNavigator();

const TabBarBlurBackground: React.FC = () => (
  <BlurView
    blurAmount={20} 
    blurType="dark" 
    style={styles.blur}
  />
);

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,

        //@ts-ignore
        //tabBarBackground: TabBarBlurBackground ,
        tabBarShowLabel: false,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <Tab.Screen
        name="HOME"
        component={HomeStack}
        // if you previously inlined tabBarIcon here, consider extracting it to a top-level component too
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    // small transparent color is okay; BlurView will render the blur as specified by blurType/blurAmount
    backgroundColor: 'rgba(0, 0, 0, 0.0000005)',
  },
  tabBar: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 0,
    elevation: 0,
    height: 65,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  tabBarIcon: {
    marginTop: 4,
    marginBottom: 3,
  },
});
