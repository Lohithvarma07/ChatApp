import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loadToken } from '../src/utils/auth';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      router.replace(token ? '/home' : '/login');
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
