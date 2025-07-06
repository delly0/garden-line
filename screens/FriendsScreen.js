import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { USERS } from '../users';

export default function FriendsScreen({ navigation }) {
  const friends = USERS.filter((u) => u.id !== 'you');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Friend</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendButton}
            onPress={() =>
              navigation.navigate('FriendGarden', { userId: item.id, userName: item.name })
            }
          >
            <Text style={styles.friendText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
  friendButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
    borderRadius: 10,
  },
  friendText: { fontSize: 18 },
});
