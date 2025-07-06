import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import LottieView from 'lottie-react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 


const flowerSources = [
  require('../assets/lottie/flower1.json'),
  require('../assets/lottie/flower2.json'),
  require('../assets/lottie/flower3.json'),
  require('../assets/lottie/flower4.json'),
];

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const [userData, setUserData] = useState(null);


  useEffect(() => {
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name,
            email: user.email,
            createdAt: user.metadata.creationTime,
          });
        } else {
          console.log('No such user document!');
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    }
  };

  fetchUserData();
}, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  if (!userData) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      <View style={styles.spacer} />

      <View style={styles.card}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{userData.name}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData.email}</Text>

        <Text style={styles.label}>Joined:</Text>
        <Text style={styles.value}>
          {new Date(userData.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Button title="Log Out" onPress={handleLogout} color="#D97B66" />

      {/* Cute flower animation row */}
      <View style={styles.flowerRow}>
        {flowerSources.map((source, idx) => (
          <LottieView
            key={idx}
            source={source}
            autoPlay
            loop
            style={styles.flower}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', paddingHorizontal: 24 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  spacer: { height: 80 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  label: { fontSize: 16, color: '#888', marginTop: 10 },
  value: { fontSize: 18, fontWeight: '500', color: '#333' },
  flowerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  flower: {
    width: width * 0.15,
    height: width * 0.15,
  },
});
