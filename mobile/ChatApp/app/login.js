import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { api } from '../src/api/api';
import { saveAuth } from '../src/utils/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      // save user + token to AsyncStorage
      await saveAuth(data.user, data.token);

      // redirect to home
      router.replace('/home');
    } catch (e) {
      console.log('Login error >>>', e?.response?.data || e.message);
      Alert.alert('Login failed', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12, marginTop: 80 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Login</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={onLogin}
        disabled={loading}
      />

      <Link href="/register" style={{ marginTop: 12, color: 'blue' }}>
        Create an account
      </Link>
    </View>
  );
}
