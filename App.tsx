import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/RootNavigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './src/navigation/AppNavigator';

const RootStack = createNativeStackNavigator();

function App() {


  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor="transparent"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default App;
