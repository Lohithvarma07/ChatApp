// mobile/ChatApp/app/home.js
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../src/api/api';
import { loadToken, loadUser, clearAuth } from '../src/utils/auth';
import {
  connectSocket,
  disconnectSocket,
  subscribePresence,
  subscribePresenceSnapshot,
  subscribeTyping,
  subscribeGlobalNewMessages,
  // subscribeGlobalRead, // optional
} from '../src/api/socket';

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [onlineById, setOnlineById] = useState({});
  const [typingById, setTypingById] = useState({});
  const [unreadByUser, setUnreadByUser] = useState({});

  useEffect(() => {
    let unsubPresence = () => {};
    let unsubPresenceSnap = () => {};
    let unsubTyping = () => {};
    let unsubNewMsg = () => {};
    // let unsubRead = () => {};

    (async () => {
      const token = await loadToken();
      const user = await loadUser();
      if (!token || !user) {
        router.replace('/login');
        return;
      }
      setMe(user);

      connectSocket(token);

      unsubPresenceSnap = subscribePresenceSnapshot((snapshot) => setOnlineById(snapshot || {}));
      unsubPresence = subscribePresence((userId, online) =>
        setOnlineById((prev) => ({ ...prev, [userId]: online }))
      );

      unsubTyping = subscribeTyping(
        (fromUserId) => setTypingById((prev) => ({ ...prev, [fromUserId]: true })),
        (fromUserId) => setTypingById((prev) => ({ ...prev, [fromUserId]: false }))
      );

      // Count unread when a new message arrives to ME
      unsubNewMsg = subscribeGlobalNewMessages((msg) => {
        if (!user?.id) return;
        if (String(msg.to) !== String(user.id)) return; // only inbound
        const fromId = String(msg.from);
        setUnreadByUser((prev) => ({ ...prev, [fromId]: (prev[fromId] || 0) + 1 }));
      });

      // Optional: if you want to react to read events globally
      // unsubRead = subscribeGlobalRead(({ conversationId }) => {
      //   // usually we do nothing here for unread counts (they represent inbound to me)
      // });

      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (e) {
        console.log('Load users error >>>', e?.response?.data || e.message);
        Alert.alert('Error', e?.response?.data?.message || 'Failed to load users');
      }
    })();

    return () => {
      unsubPresence();
      unsubPresenceSnap();
      unsubTyping();
      unsubNewMsg();
      // unsubRead();
      disconnectSocket();
    };
  }, []);

  const startChat = async (otherUser) => {
    try {
      const { data: conv } = await api.post('/conversations', {
        senderId: me.id,
        receiverId: otherUser._id,
      });

      // ✅ Clear unread for this user as we open their chat
      setUnreadByUser((prev) => ({ ...prev, [otherUser._id]: 0 }));

      router.push({
        pathname: `/chat/${conv._id}`,
        params: { toId: otherUser._id, name: otherUser.name },
      });
    } catch (e) {
      console.log('startChat error >>>', e?.response?.data || e.message);
      Alert.alert('Error', e?.response?.data?.message || e.message);
    }
  };

  const renderItem = ({ item }) => {
    if (String(item._id) === String(me?.id)) return null;
    const isTyping = !!typingById[item._id];
    const isOnline = !!onlineById[item._id];
    const unread = unreadByUser[item._id] || 0;

    let subText = '';
    let color = '#666';
    if (isTyping) {
      subText = 'typing…';
      color = '#2a8';
    } else if (unread > 0) {
      subText = unread === 1 ? '1 new message' : `${unread} new messages`;
      color = '#c00';
    } else {
      subText = isOnline ? 'Online' : 'Offline';
      color = isOnline ? '#090' : '#666';
    }

    return (
      <TouchableOpacity
        onPress={() => startChat(item)}
        style={{ padding: 12, borderWidth: 1, borderRadius: 10, backgroundColor: '#f9f9f9', marginBottom: 8 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>{item.name}</Text>
          {unread > 0 ? (
            <View
              style={{
                minWidth: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: '#c00',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{unread}</Text>
            </View>
          ) : null}
        </View>
        <Text style={{ fontSize: 12, color, marginTop: 2 }}>{subText}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Chats</Text>
        <Button
          title="Logout"
          onPress={async () => {
            await clearAuth();
            disconnectSocket();
            router.replace('/login');
          }}
        />
      </View>

      <FlatList data={users} keyExtractor={(item) => item._id} renderItem={renderItem} />
    </View>
  );
}
