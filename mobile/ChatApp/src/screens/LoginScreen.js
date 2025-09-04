import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import api from '../api/api';
import { saveAuth } from '../utils/auth';
import { connectSocket } from '../api/socket';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      await saveAuth(res.data.token, res.data.user);
      await connectSocket();
      navigation.reset({ index:0, routes:[{name:'Home'}] });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={{ flex:1, padding:16, justifyContent:'center' }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{borderWidth:1, padding:8, marginBottom:8}} />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={{borderWidth:1, padding:8, marginBottom:8}} />
      <Button title="Login" onPress={onLogin} />
      <Text style={{marginTop:12}} onPress={() => navigation.navigate('Register')}>Create account</Text>
    </View>
  );
}
