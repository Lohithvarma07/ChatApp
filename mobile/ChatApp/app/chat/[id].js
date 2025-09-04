// mobile/ChatApp/app/chat/[id].js
import { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, Button, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { api } from '../../src/api/api';
import { loadToken, loadUser } from '../../src/utils/auth';
import {
  connectSocket,
  listenMessageEvents,
  sendSocketMessage,
  markRead,
  emitTypingStart,
  emitTypingStop,
  subscribeTypingForConversation,
} from '../../src/api/socket';

export default function ChatScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  const { id: conversationId, toId, name } = useLocalSearchParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [me, setMe] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: name || 'Chat' });
  }, [name, navigation]);

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      connectSocket(token);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const user = await loadUser();
        setMe(user);
        const { data } = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(data);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 0);
      } catch (e) {
        console.log('Load messages error >>>', e?.response?.data || e.message);
        Alert.alert('Error', e?.response?.data?.message || 'Failed to load messages');
      }
    })();
  }, [conversationId]);

  useEffect(() => {
    const unsub = listenMessageEvents(setMessages, conversationId);
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    if (!toId) return;
    const unsub = subscribeTypingForConversation(conversationId, toId, setIsTyping);
    return unsub;
  }, [conversationId, toId]);

  // ✅ Only mark as read when THIS screen is focused (visible) on receiver
  useEffect(() => {
    if (!me || !isFocused) return;
    messages
      .filter((m) => String(m.to) === String(me.id) && m.status !== 'read')
      .forEach((m) => markRead(m._id));
  }, [messages, me, isFocused]);

  const onChangeText = (val) => {
    setText(val);
    try {
      emitTypingStart({ to: toId, conversationId });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        emitTypingStop({ to: toId, conversationId });
      }, 1000);
    } catch {}
  };

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendSocketMessage({ conversationId, to: toId, text: trimmed });
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const renderItem = ({ item }) => {
    const mine = String(item.from) === String(me?.id);
    return (
      <View
        style={{
          alignSelf: mine ? 'flex-end' : 'flex-start',
          backgroundColor: mine ? '#DCF8C6' : '#EEE',
          padding: 8,
          borderRadius: 8,
          marginVertical: 4,
          maxWidth: '70%',
        }}
      >
        <Text>{item.text}</Text>
        {mine ? (
          <Text style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
            {item.status === 'sent' && '✓'}
            {item.status === 'delivered' && '✓✓'}
            {item.status === 'read' && '✓✓ (Read)'}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: 'height', default: 'height' })}
      // Add header height so the view lifts above keyboard + header on all devices
      keyboardVerticalOffset={Platform.OS === 'ios'
        ? headerHeight
        : headerHeight}
    >
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
        />

        {isTyping ? <Text style={{ color: '#2a8', marginLeft: 18, marginBottom: 4 }}>typing…</Text> : null}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingBottom: Math.max(insets.bottom, 8),
            gap: 8,
            backgroundColor: '#fff',
          }}
        >
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: Platform.OS === 'ios' ? 12 : 8,
              backgroundColor: '#fff',
            }}
            placeholder={name ? `Message ${name}...` : 'Type a message...'}
            value={text}
            onChangeText={onChangeText}
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
