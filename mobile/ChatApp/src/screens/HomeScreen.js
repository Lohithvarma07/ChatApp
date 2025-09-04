import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import api from '../api/api';
import { getAuth } from '../utils/auth';
import { getSocket } from '../api/socket';

export default function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      const auth = await getAuth();
      setMe(auth.user);
      fetchUsers();
      const socket = getSocket();
      if (socket) {
        socket.on('user:online', ({ userId, online }) => {
          setUsers(prev => prev.map(u => u._id === userId ? {...u, online} : u));
        });
      }
    })();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.map(u => ({...u, online: false})));
    } catch (err) { console.error(err); }
  };

  const startChat = async (otherUser) => {
    try {
      const res = await api.post('/conversations', { withUserId: otherUser._id });
      navigation.navigate('Chat', { conversation: res.data, otherUser });
    } catch (err) { console.error(err); }
  };

  return (
    <View style={{flex:1}}>
      <FlatList
        data={users}
        keyExtractor={item=>item._id}
        renderItem={({item}) => (
          <TouchableOpacity style={{padding:16, borderBottomWidth:1}} onPress={()=>startChat(item)}>
            <Text>{item.name} {item.online ? '(online)' : '(offline)'}</Text>
            <Text style={{color:'#666', fontSize:12}}>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
