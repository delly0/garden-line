// screens/PresenceTabs.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';

export default function PresenceTabs() {
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;
  const [userColor, setUserColor] = useState();
  
  useEffect(() => {
    const fetchFriends = async () => {
      if (!userId) return;

      const userSnap = await getDoc(doc(db, 'users', userId));
      const userData = userSnap.data() || {};
      const friendIds = userSnap.data()?.friends || [];
      const userColor = userData.color || '#A1C181';

      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const friendList = allUsers.filter((u) => friendIds.includes(u.id));
      setFriends(friendList);
      setUserColor(userColor);
    };

    fetchFriends();
  }, []);

  const enterPresence = (friend) => {
    const chatId = [userId, friend.id].sort().join('_');

    navigation.navigate('SharedPresence', {
      friendId: friend.id,
      friendName: friend.name,
      userColor, 
      friendColor: friend.color || '#FFCBA4',
      chatId,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color + '33' || '#eee' }]}
      onPress={() => enterPresence(item)}
    >
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Shared Space</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>No friends yet 🥲</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardText: { fontSize: 16, fontWeight: '500' },
});
