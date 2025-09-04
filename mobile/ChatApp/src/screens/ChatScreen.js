import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../api/api';
import { getSocket } from '../api/socket';
import { getAuth } from '../utils/auth';

export default function ChatScreen({ route }) {
  const { conversation, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingFromOther, setTypingFromOther] = useState(false);
  const socket = getSocket();
  const authRef = useRef(null);

  useEffect(() => {
    (async () => {
      const auth = await getAuth();
      authRef.current = auth;
      // load messages
      const res = await api.get(`/conversations/${conversation._id}/messages`);
      setMessages(res.data);
    })();

    if (!socket) return;
    const onNew = (msg) => {
      // ensure it's for this conversation
      if (String(msg.conversation) === String(conversation._id)) {
        setMessages(prev => [...prev, msg]);
        // emit read immediately (for demo)
        socket.emit('message:read', { messageId: msg._id });
      }
    };
    socket.on('message:new', onNew);

    socket.on('typing:start', ({ from }) => {
      if (from === otherUser._id) setTypingFromOther(true);
    });
    socket.on('typing:stop', ({ from }) => {
      if (from === otherUser._id) setTypingFromOther(false);
    });

    socket.on('message:read', ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: 'read' } : m));
    });

    socket.on('message:delivered', ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status: 'delivered' } : m));
    });

    return () => {
      socket.off('message:new', onNew);
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('message:read');
      socket.off('message:delivered');
    };
  }, []);

  let typingTimer = useRef(null);

  const sendTypingStart = () => {
    if (!socket) return;
    socket.emit('typing:start', { to: otherUser._id });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:stop', { to: otherUser._id });
    }, 1500);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const payload = {
      conversationId: conversation._id,
      to: otherUser._id,
      text,
    };
    // locally show optimistic message
    const temp = {
      _id: 'temp-' + Date.now(),
      conversation: conversation._id,
      from: authRef.current.user.id,
      to: otherUser._id,
      text, status: 'sent', createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, temp]);
    setText('');
    if (socket) socket.emit('message:send', payload);
  };

  const renderItem = ({ item }) => (
    <View style={{ padding:8, alignSelf: item.from === authRef.current.user.id ? 'flex-end' : 'flex-start' }}>
      <Text style={{ backgroundColor: '#eee', padding:8, borderRadius:6 }}>{item.text}</Text>
      <Text style={{ fontSize:10 }}>{item.status || 'sent'}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList data={messages} keyExtractor={m=>m._id} renderItem={renderItem} />
      {typingFromOther ? <Text style={{paddingLeft:8}}>Typing...</Text> : null}
      <View style={{ flexDirection:'row', padding:8 }}>
        <TextInput
          value={text}
          onChangeText={(t)=>{ setText(t); sendTypingStart(); }}
          placeholder="Message"
          style={{ flex:1, borderWidth:1, padding:8, borderRadius:8 }}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}
