import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, StyleSheet, Dimensions, View } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore'; // make sure this is imported at the top

const { width, height } = Dimensions.get('window');

export default function MoodLamp({ ownerId }) {
  const currentUserId = auth.currentUser?.uid;
  const isOwnGarden = ownerId === currentUserId;

  const [lampColor, setLampColor] = useState('#FFDDEE');

  // Listen to live color changes
  useEffect(() => {
    const lampRef = doc(db, 'users', ownerId);
    const unsubscribe = onSnapshot(lampRef, (docSnap) => {
      if (docSnap.exists()) {
        setLampColor(docSnap.data()?.lampColor || '#FFDDEE');
      }
    });

    return () => unsubscribe();
  }, [ownerId]);

  // When friend taps lamp, update that user's color to current user's mood color
  const handleTap = async () => {
    if (isOwnGarden) return;

    try {
    const userColorRef = doc(db, 'users', currentUserId);
    const userSnap = await getDoc(userColorRef);
    const userColor = userSnap?.data()?.color || '#BAFFC9';

      await updateDoc(doc(db, 'users', ownerId), {
        lampColor: userColor,
      });
    } catch (error) {
      console.log('Error updating lamp color:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleTap}
      disabled={isOwnGarden}
      style={styles.lampWrapper}
      // style={[
      //   styles.lampWrapper,
      //   { shadowColor: lampColor, shadowRadius: 20 },
      // ]}
    >
      {/* GLOW CIRCLE */}
      <View
        style={[
          styles.glow,
          {
            backgroundColor: lampColor,
            shadowColor: lampColor,
          },
        ]}
      />
      <Image
        source={require('../assets/images/lamppost.png')}
        style={styles.lampImage}
        // style={[styles.lampImage, { tintColor: lampColor }]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  lampWrapper: {
    position: 'absolute',
    left: width * 0.01,
    bottom: 250, // closer to the ground
    alignItems: 'center',
    zIndex: 5,
  },
  lampImage: {
    width: width * 0.5,  // bigger
    height: width * 0.6, // taller for lamppost
  },
  glow: {
    width: 60,
    height: 60,
    borderRadius: 40,
    marginBottom: -80,
    opacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 8,
  },
});
