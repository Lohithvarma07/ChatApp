import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { api } from '../src/api/api';
import { saveAuth } from '../src/utils/auth';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { name, email, password });
      await saveAuth(data.user, data.token);
      router.replace('/home');
    } catch (e) {
      console.log('Register error >>>', e?.response?.data || e.message);
      Alert.alert('Register failed', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12, marginTop: 80 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Register</Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />
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
      <Button title={loading ? 'Creating...' : 'Register'} onPress={onRegister} disabled={loading} />
      <Link href="/login" style={{ marginTop: 12, color: 'blue' }}>
        Back to Login
      </Link>
    </View>
  );
}
