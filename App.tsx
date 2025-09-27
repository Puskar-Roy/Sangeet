import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/RootNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './src/navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePlayerStore } from './src/store/playerStore';
const RootStack = createNativeStackNavigator();
const queryClient = new QueryClient();
function App() {
   useEffect(() => {
     // Initialize AudioPro event listeners when app starts
     const initializePlayer = () => {
       try {
         const store = usePlayerStore.getState();
         store.initializeAudioProListener();

         // Clean up polling on unmount
         return () => {
           store.stopStatePolling();
         };
       } catch (error) {
         console.error('Failed to initialize player:', error);
       }
     };

     const cleanup = initializePlayer();

     return cleanup;
   }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={'light-content'}
            backgroundColor="#0a071e"
            translucent={true}
            hidden={false}
          />

          <NavigationContainer ref={navigationRef}>
            <SafeAreaView style={styles.container} edges={['bottom']}>
              <RootStack.Navigator
                screenOptions={{
                  headerShown: false,
                  presentation: 'card',
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              >
                <RootStack.Screen name="App" component={AppNavigator} />
              </RootStack.Navigator>
            </SafeAreaView>
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default App;
