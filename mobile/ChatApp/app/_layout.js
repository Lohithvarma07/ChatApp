// mobile/ChatApp/app/_layout.js
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        <Stack.Screen name="home" options={{ title: 'Chats' }} />
        <Stack.Screen
          name="chat/[id]"
          options={({ route }) => ({ title: route.params?.name || 'Chat' })}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
