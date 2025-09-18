// src/navigation/RootNavigation.ts
import {
  createNavigationContainerRef,
  CommonActions,
  StackActions,
  NavigatorScreenParams,
} from '@react-navigation/native';

// Define your tab navigator's screens
export type TabParamList = {
  Home: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
  // Add more tabs as needed
};

// Define stack navigators for each tab
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: { userId: string };
  ProfileSettings: undefined;
  // Add more screens as needed
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  NotificationSettings: undefined;
  Privacy: { section?: string };
  // Add more screens as needed
};

// Define your root navigator (if you have one above tabs)
export type RootParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Modal: { title: string; content: string };
  Login: undefined;
  // Add more root level screens as needed
};

// Helper type for nested navigation
export type NestedNavigationParams<T extends keyof TabParamList> =
  TabParamList[T] extends NavigatorScreenParams<infer U> ? U : never;

// Create properly typed navigation ref
export const navigationRef = createNavigationContainerRef<RootParamList>();

// Basic navigation function with proper typing
export function navigate<T extends keyof RootParamList>(
  name: T,
  params?: RootParamList[T],
): void {
  if (navigationRef.isReady()) {
    if (params !== undefined) {
      (navigationRef as any).navigate(name, params);
    } else {
      (navigationRef as any).navigate(name);
    }
  } else {
    // Queue the navigation action if not ready
    navigationRef.dispatch(
      CommonActions.navigate({
        name,
        params,
      }),
    );
  }
}

// Nested navigation for tab + stack navigation
export function navigateNested<
  TTab extends keyof TabParamList,
  TScreen extends keyof NestedNavigationParams<TTab>,
>(
  tabName: TTab,
  stackScreen: TScreen,
  params?: NestedNavigationParams<TTab>[TScreen],
): void {
  const navigationParams = {
    name: tabName,
    params: {
      screen: stackScreen,
      params,
    },
  };

  if (navigationRef.isReady()) {
    navigationRef.navigate(
      tabName as keyof RootParamList,
      {
        screen: stackScreen,
        params,
      } as any,
    );
  } else {
    navigationRef.dispatch(CommonActions.navigate(navigationParams));
  }
}

// Additional utility functions with proper typing

export function goBack(): void {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function reset<T extends keyof RootParamList>(
  routeName: T,
  params?: RootParamList[T],
): void {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      }),
    );
  }
}

export function push<T extends keyof RootParamList>(
  name: T,
  params?: RootParamList[T],
): void {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}

export function replace<T extends keyof RootParamList>(
  name: T,
  params?: RootParamList[T],
): void {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

// Type-safe current route name getter
export function getCurrentRouteName(): string | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}

// Type-safe parameter getter for current route
export function getCurrentRouteParams<T extends keyof RootParamList>():
  | RootParamList[T]
  | undefined {
  if (navigationRef.isReady()) {
    const route = navigationRef.getCurrentRoute();
    return route?.params as RootParamList[T] | undefined;
  }
  return undefined;
}
