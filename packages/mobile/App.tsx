import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import JoinAgencyScreen from './src/screens/agency/JoinAgencyScreen';
import AgencyScreen from './src/screens/agency/AgencyScreen';
import WalletScreen from './src/screens/wallet/WalletScreen';
import TopupScreen from './src/screens/wallet/TopupScreen';
import SendGiftScreen from './src/screens/wallet/SendGiftScreen';
import TransactionsScreen from './src/screens/wallet/TransactionsScreen';
import ChatListScreen from './src/screens/chat/ChatListScreen';
import ChatRoomScreen from './src/screens/chat/ChatRoomScreen';

// Import store
import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack (Login/Signup)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{ headerShown: true, title: 'Sign Up' }}
      />
    </Stack.Navigator>
  );
}

// Main App Stack (After Login)
function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ title: 'My Wallet' }}
      />
      <Stack.Screen 
        name="Topup" 
        component={TopupScreen}
        options={{ title: 'Top Up Diamonds' }}
      />
      <Stack.Screen 
        name="SendGift" 
        component={SendGiftScreen}
        options={{ title: 'Send Gift' }}
      />
      <Stack.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{ title: 'Transaction History' }}
      />
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen 
        name="JoinAgency" 
        component={JoinAgencyScreen}
        options={{ title: 'Join Agency' }}
      />
      <Stack.Screen 
        name="Agency" 
        component={AgencyScreen}
        options={{ title: 'My Agency' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isLoading, loadStoredUser } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Load stored user on app start
    const initAuth = async () => {
      await loadStoredUser();
      setInitializing(false);
    };

    initAuth();
  }, []);

  // Show loading screen while checking auth
  if (initializing || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
