
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper
      ]}
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const focused = state.index === index;

          const onPress = (e: GestureResponderEvent) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // use the tabBarIcon option if provided (we passed it in AppNavigator)
          const icon = descriptor.options.tabBarIcon
            ? descriptor.options.tabBarIcon({
                focused,
                color: '#fff',
                size: 24,
              })
            : null;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
              //@ts-ignore
              testID={descriptor.options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.9}
              style={styles.tabButton}
            >
              <View
                style={focused ? styles.iconWrapperFocused : styles.iconWrapper}
              >
                {/* We render icon inside wrapper so we can add the glow / outline */}
                {icon}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    // make sure it's above other content
    elevation: 10,
    zIndex: 20,
    
  },
  container: {
    height: 72,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    // dark translucent background
    backgroundColor: '#0a091e', // slightly different black for depth
    opacity: 0.98,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    
    
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperFocused: {
    padding: 8,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
 
    transform: [{ translateY: -4 }],
   
  },
});


