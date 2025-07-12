import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function MessagesScreen() {
  const [friends, setFriends] = useState([]);
  const [messagesPreview, setMessagesPreview] = useState({});
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchFriendsAndMessages = async () => {
      const userSnap = await getDoc(doc(db, 'users', userId));
      const friendIds = userSnap.data()?.friends || [];

      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const friendList = allUsers.filter((u) => friendIds.includes(u.id));
      setFriends(friendList);

      friendList.forEach((friend) => {
        const chatId = [userId, friend.id].sort().join('_');
        const chatRef = collection(db, 'chats', chatId, 'messages');
        const q = query(chatRef, orderBy('timestamp', 'desc'));

        onSnapshot(q, (snap) => {
          const messages = snap.docs.map((doc) => doc.data());
          if (messages.length > 0) {
            setMessagesPreview((prev) => ({
              ...prev,
              [friend.id]: messages[0],
            }));
          }
        });
      });
    };

    fetchFriendsAndMessages();
  }, []);

  const openChat = (friend) => {
    navigation.navigate('Chat', {
      userId: friend.id,
      userName: friend.name,
      userColor: friend.color || '#FADADD',
    });
  };

    const renderItem = ({ item }) => {
      const preview = messagesPreview[item.id];

      const previewText = preview
        ? preview.type === 'text'
          ? preview.content.length > 50
            ? preview.content.substring(0, 47) + '...'
            : preview.content
          : preview.type === 'flower'
          ? '🌸 You received a flower!'
          : preview.type === 'image'
          ? '[Image]'
          : preview.type === 'audio'
          ? '[Audio]'
          : preview.type === 'song'
          ? '[Spotify Track]'
          : '[Attachment]'
        : 'Start chatting...';

      return (
        <TouchableOpacity
          style={[styles.chatItem, { backgroundColor: item.color || '#f0f0f0' }]}
          onPress={() => openChat(item)}
        >
          <Text style={[styles.name, { color: '#333' }]}>{item.name}</Text>
          <Text style={styles.preview} numberOfLines={1}>
            {previewText}
          </Text>
        </TouchableOpacity>
      );
    };


  return (
    <View style={styles.container}>
      <FlatList data={friends} keyExtractor={(item) => item.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  chatItem: {
    padding: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  preview: { fontSize: 14, color: '#666', marginTop: 4 },
});
