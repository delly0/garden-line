import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import LottieView from 'lottie-react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import { updateDoc } from 'firebase/firestore';
// import { ColorPicker } from 'react-native-color-picker';
import ColorPicker from 'react-native-wheel-color-picker';
import { Modal } from 'react-native';



const flowerSources = [
  require('../assets/lottie/flower1.json'),
  require('../assets/lottie/flower2.json'),
  require('../assets/lottie/flower3.json'),
  require('../assets/lottie/flower4.json'),
];

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const [userData, setUserData] = useState(null);

  const [userColor, setUserColor] = useState(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [tempColor, setTempColor] = useState(userColor);


  useEffect(() => {
    if (userData?.color) {
      setUserColor(userData.color);
    }
  }, [userData]);

  const updateColor = async (newColor) => {
    setUserColor(newColor);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { color: newColor });
    } catch (err) {
      console.log('Error updating color:', err);
    }
  };



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
  <TouchableOpacity
    onPress={() => {
      setTempColor(userColor); // initialize with current color
      setColorPickerVisible(true);
    }}
    style={[styles.selectedColorPreview, { backgroundColor: userColor || '#ccc' }]}
  >
    <Text style={styles.colorText}>Tap to change</Text>
  </TouchableOpacity>

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

      <Text style={styles.label}>My Colour:</Text>
      <TouchableOpacity
        onPress={() => setColorPickerVisible(true)}
        style={[styles.selectedColorPreview, { backgroundColor: userColor || '#ccc' }]}
      >
        <Text style={styles.colorText}>Tap to change</Text>
      </TouchableOpacity>

      <Modal
        visible={colorPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.pickerTitle}>Pick Your Colour</Text>

            <ColorPicker
              color={tempColor || '#FFB3BA'}
              onColorChange={setTempColor}
              thumbSize={24}
              sliderSize={24}
              noSnap={true}
              row={false}
              style={{ width: 290, height: 290 }}
            />

            <View style={styles.buttonRow}>
              <Button
                title="Cancel"
                onPress={() => {
                  setTempColor(userColor);
                  setColorPickerVisible(false);
                }}
              />
              <Button
                title="Done"
                onPress={() => {
                  updateColor(tempColor);
                  setColorPickerVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

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
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 30,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',  // semi-transparent dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 340,
    height: 430,  // enough height for color picker + buttons + text
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    justifyContent: 'space-between',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
