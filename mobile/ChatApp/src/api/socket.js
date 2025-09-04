// mobile/ChatApp/src/api/socket.js
import { io } from 'socket.io-client';
import { API_BASE } from './api';

let socket;

export function connectSocket(token) {
  if (socket?.connected) return socket;
  socket = io(API_BASE, {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
  });
  socket.on('connect', () => console.log('🔌 socket connected', socket.id));
  socket.on('connect_error', (err) => console.log('❌ socket error', err?.message || String(err)));
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}

/** ---------- Messaging (scoped to one conversation) ---------- */
export function listenMessageEvents(setMessages, conversationId) {
  if (!socket) return () => {};

  const onSent = (msg) => {
    if (String(msg.conversation) !== String(conversationId)) return;
    setMessages((prev) => (prev.some((m) => String(m._id) === String(msg._id)) ? prev : [...prev, msg]));
  };

  const onNew = (msg) => {
    if (String(msg.conversation) !== String(conversationId)) return;
    setMessages((prev) => [...prev, msg]);
  };

  const onDelivered = ({ messageId, conversationId: cid }) => {
    if (String(cid) !== String(conversationId)) return;
    setMessages((prev) => prev.map((m) => (String(m._id) === String(messageId) ? { ...m, status: 'delivered' } : m)));
  };

  const onRead = ({ messageId, conversationId: cid }) => {
    if (String(cid) !== String(conversationId)) return;
    setMessages((prev) => prev.map((m) => (String(m._id) === String(messageId) ? { ...m, status: 'read' } : m)));
  };

  socket.on('message:sent', onSent);
  socket.on('message:new', onNew);
  socket.on('message:delivered', onDelivered);
  socket.on('message:read', onRead);

  // cleanup these specific handlers only
  return () => {
    socket.off('message:sent', onSent);
    socket.off('message:new', onNew);
    socket.off('message:delivered', onDelivered);
    socket.off('message:read', onRead);
  };
}

/** ---------- Presence ---------- */
export function subscribePresenceSnapshot(applySnapshot) {
  if (!socket) return () => {};
  const handler = (snapshot) => applySnapshot(snapshot || {});
  socket.on('presence:all', handler);
  return () => socket.off('presence:all', handler);
}

export function subscribePresence(onPresence) {
  if (!socket) return () => {};
  const handler = ({ userId, online }) => onPresence(userId, online);
  socket.on('user:online', handler);
  return () => socket.off('user:online', handler);
}

/** ---------- Typing ---------- */
export function subscribeTyping(onStart, onStop) {
  if (!socket) return () => {};
  const startHandler = ({ from }) => onStart(from);
  const stopHandler = ({ from }) => onStop(from);
  socket.on('typing:start', startHandler);
  socket.on('typing:stop', stopHandler);
  return () => {
    socket.off('typing:start', startHandler);
    socket.off('typing:stop', stopHandler);
  };
}

export function subscribeTypingForConversation(conversationId, otherUserId, setTyping) {
  if (!socket) return () => {};
  let timeout;
  const clear = () => { if (timeout) clearTimeout(timeout); timeout = undefined; };

  const startHandler = ({ from, conversationId: cid }) => {
    if (String(cid) !== String(conversationId) || String(from) !== String(otherUserId)) return;
    setTyping(true);
    clear();
    timeout = setTimeout(() => setTyping(false), 2000);
  };

  const stopHandler = ({ from, conversationId: cid }) => {
    if (String(cid) !== String(conversationId) || String(from) !== String(otherUserId)) return;
    setTyping(false);
    clear();
  };

  socket.on('typing:start', startHandler);
  socket.on('typing:stop', stopHandler);

  return () => {
    clear();
    socket.off('typing:start', startHandler);
    socket.off('typing:stop', stopHandler);
  };
}

/** ---------- Global New Message (for Home badges) ---------- */
export function subscribeGlobalNewMessages(onNewMessage) {
  if (!socket) return () => {};
  const handler = (msg) => onNewMessage(msg); // msg has .from, .to, .conversation
  socket.on('message:new', handler);
  return () => socket.off('message:new', handler);
}

/** Emitters */
export function emitTypingStart({ to, conversationId }) {
  socket?.emit('typing:start', { to, conversationId });
}
export function emitTypingStop({ to, conversationId }) {
  socket?.emit('typing:stop', { to, conversationId });
}
export function sendSocketMessage({ conversationId, to, text }) {
  socket?.emit('message:send', { conversationId, to, text });
}
export function markRead(messageId) {
  socket?.emit('message:read', { messageId });
}
