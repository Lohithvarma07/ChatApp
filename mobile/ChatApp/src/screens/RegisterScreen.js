import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import api from '../api/api';
import { saveAuth } from '../utils/auth';
import { connectSocket } from '../api/socket';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      await saveAuth(res.data.token, res.data.user);
      await connectSocket();
      navigation.reset({ index:0, routes:[{name:'Home'}] });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={{ flex:1, padding:16, justifyContent:'center' }}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{borderWidth:1, padding:8, marginBottom:8}} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{borderWidth:1, padding:8, marginBottom:8}} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, padding:8, marginBottom:8}} />
      <Button title="Register" onPress={onRegister} />
    </View>
  );
}
