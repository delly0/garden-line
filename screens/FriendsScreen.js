import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

export default function FriendsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [userDoc, setUserDoc] = useState(null);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const userSnap = await getDoc(doc(db, 'users', userId));
      const userData = userSnap.data();
      setUserDoc(userData);

      const usersSnap = await getDocs(collection(db, 'users'));
      const all = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const friendList = all.filter((u) => userData.friends?.includes(u.id));
      const incoming = all.filter((u) => userData.incomingRequests?.includes(u.id));
      const outgoing = userData.outgoingRequests || [];

      setAllUsers(all);
      setFriends(friendList);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    };

    fetchData();
  }, [userId]);

  const sendFriendRequest = async (targetId) => {
    if (!userId || targetId === userId) return;

    await updateDoc(doc(db, 'users', targetId), {
      incomingRequests: arrayUnion(userId),
    });

    await updateDoc(doc(db, 'users', userId), {
      outgoingRequests: arrayUnion(targetId),
    });

    Alert.alert('Request sent!', 'Your friend request has been sent.');
  };

  const acceptFriendRequest = async (requesterId) => {
    await updateDoc(doc(db, 'users', userId), {
      friends: arrayUnion(requesterId),
      incomingRequests: arrayRemove(requesterId),
    });

    await updateDoc(doc(db, 'users', requesterId), {
      friends: arrayUnion(userId),
      outgoingRequests: arrayRemove(userId),
    });

    // Refresh data immediately
    const updatedSnap = await getDoc(doc(db, 'users', userId));
    const updatedData = updatedSnap.data();

    setUserDoc(updatedData);
    setFriends(allUsers.filter((u) => updatedData.friends?.includes(u.id)));
    setIncomingRequests(allUsers.filter((u) => updatedData.incomingRequests?.includes(u.id)));
    setOutgoingRequests(updatedData.outgoingRequests || []);
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      u.id !== userId &&
      !userDoc?.friends?.includes(u.id) &&
      !userDoc?.incomingRequests?.includes(u.id) &&
      !userDoc?.outgoingRequests?.includes(u.id)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Friends 🌼</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendButton}
            onPress={() =>
              navigation.navigate('FriendGarden', {
                userId: item.id,
                userName: item.name,
              })
            }
          >
            <Text style={styles.friendText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No friends yet.</Text>}
      />

      {incomingRequests.length > 0 && (
        <>
          <Text style={styles.title}>Incoming Requests 📥</Text>
          <FlatList
            data={incomingRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.requestRow}>
                <Text style={styles.friendText}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => acceptFriendRequest(item.id)}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}

      <Text style={styles.title}>Search Users 🔍</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by name"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestRow}>
            <Text style={styles.friendText}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => sendFriendRequest(item.id)}
              style={styles.sendBtn}
            >
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginTop: 20 },
  friendButton: {
    padding: 15,
    backgroundColor: '#DFF0E2',
    marginVertical: 6,
    borderRadius: 10,
  },
  friendText: { fontSize: 16 },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  acceptBtn: {
    backgroundColor: '#B6E2A1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptText: { fontSize: 14, color: '#333' },
  sendBtn: {
    backgroundColor: '#ADD8E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sendText: { fontSize: 14, color: '#333' },
  input: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  emptyText: { color: '#888', marginVertical: 10 },
});
