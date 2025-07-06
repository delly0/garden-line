import React, { useEffect, useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import {
  doc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';

const flowerAnimations = [
  require('../assets/lottie/flower1.json'),
  require('../assets/lottie/flower2.json'),
  require('../assets/lottie/flower3.json'),
  require('../assets/lottie/flower4.json'),
  
];

function FlowerThoughtContent({ thought }) {
  const { width } = Dimensions.get('window');
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  // Handle audio loading/unloading
  useEffect(() => {
    if (thought.type === 'audio' && typeof thought.content === 'string') {
      const loadSound = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync({ uri: thought.content });
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;
            setIsPlaying(status.isPlaying);
          });
        } catch (error) {
          console.log('Error loading audio', error);
        }
      };
      loadSound();

      return () => {
        if (soundRef.current) {
          soundRef.current.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
        }
      };
    }
  }, [thought]);

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.log('Error in play/pause', error);
    }
  };

  // Spotify track ID extractor
  function extractTrackId(url) {
    if (!url) return '';
    let match = url.match(/track\/([a-zA-Z0-9]+)/);
    if (match && match[1]) return match[1];
    match = url.match(/spotify:track:([a-zA-Z0-9]+)/);
    if (match && match[1]) return match[1];
    return '';
  }

  if (thought.type === 'text') {
    return <Text style={styles.flowerMessage}>"{thought.content}"</Text>;
  } else if (thought.type === 'image') {
    return (
      <Image
        source={{ uri: thought.content }}
        style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 10 }}
        resizeMode="cover"
      />
    );
  } else if (thought.type === 'audio') {
    return (
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={handlePlayPause} style={styles.audioButton}>
          <Text style={{ color: '#5A3E88' }}>{isPlaying ? 'Pause Audio' : 'Play Audio'}</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (thought.type === 'song') {
    const trackId = extractTrackId(thought.content);
    if (!trackId) {
      return <Text style={{ color: 'red' }}>⚠️ Invalid Spotify link</Text>;
    }
    return (
      <View style={{ height: 100, overflow: 'hidden', borderRadius: 12, marginBottom: 10 }}>
        <WebView
          source={{ uri: `https://open.spotify.com/embed/track/${trackId}` }}
          style={{ width: width * 0.8, height: 100 }}
          javaScriptEnabled
          scrollEnabled={false}
        />
      </View>
    );
  }

  return null;
}


export default function ChatScreen({ route }) {
  const { userId: friendId, userName } = route.params;
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Generate a consistent chat ID for any pair of users
  const chatId = [currentUser.uid, friendId].sort().join('_');

  useEffect(() => {
    const chatRef = collection(db, 'chats', chatId, 'messages');
    const q = query(chatRef, orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
  if (messages.length > 0) {
    flatListRef.current?.scrollToIndex({
      index: messages.length - 1,
      animated: true,
      viewPosition: 1, // 1 means bottom of the view
    });
  }
}, [messages]);

const flatListRef = React.useRef(null);

const onScrollToIndexFailed = (info) => {
  // Scroll to the closest possible offset instead
  flatListRef.current?.scrollToOffset({
    offset: info.averageItemLength * info.index,
    animated: true,
  });
};




  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const chatRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(chatRef, {
        senderId: currentUser.uid,
        content: input.trim(),
        timestamp: serverTimestamp(),
      });
      setInput('');
    } catch (err) {
      console.log('Send error:', err);
    }
  };

    const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
    });

    if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        await sendImageMessage(imageUri);
    }
    };


  const sendImageMessage = async (imageUri) => {
  try {
    const chatRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(chatRef, {
      content: imageUri,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
      type: 'image',
    });
  } catch (error) {
    console.log('Send image error:', error);
  }
};

const renderItem = ({ item, index }) => {
  const isMe = item.senderId === currentUser.uid;
  const prevMessage = messages[index - 1];
  
let showTimestamp = true;

if (prevMessage?.timestamp && item.timestamp) {
  const gap = (item.timestamp.toDate() - prevMessage.timestamp.toDate()) / 60000;
  showTimestamp = gap > 10;
}

  return (
    <>
        {showTimestamp && item.timestamp ? (
            <Text style={styles.timestampText}>
                {item.timestamp.toDate().toLocaleString()}
            </Text>
            ) : null}

      <View
        style={[
          styles.message,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {item.type === 'text' || !item.type ? (
          <Text style={styles.content}>{item.content}</Text>
        ) : (item.type === 'image' || item.type === 'gif') ? (
          <Image
            source={{ uri: item.content }}
            style={{ width: 200, height: 200, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : null}


      {item.type === 'flower' && item.thought && (
        <View style={styles.flowerCard}>
          <Text style={styles.flowerSender}>
            🌸 {item.thought.sender || 'Someone'} planted a flower for you
          </Text>

          <FlowerThoughtContent thought={item.thought} />

          <LottieView
            source={flowerAnimations[Math.floor(Math.random() * flowerAnimations.length)]}
            autoPlay
            loop
            style={styles.flowerLottie}
          />
        </View>
      )}

      </View>
    </>
  );
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onContentSizeChange={() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToIndex({
        index: messages.length - 1,
        animated: true,
        viewPosition: 1,
      });
    }
  }}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.sendButton}>
            <Text style={styles.sendText}>📷</Text>
        </TouchableOpacity>

        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  message: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#FADADD',
    alignSelf: 'flex-start',
  },
  sender: {
    fontSize: 12,
    color: '#555',
  },
  content: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#68C290',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timestampText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
  },
  flowerCard: {
    backgroundColor: '#E8D8F8', 
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignSelf: 'stretch', 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  flowerSender: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
    color: '#5A3E88',
  },
  flowerMessage: {
    fontStyle: 'italic',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  flowerLottie: {
    width: '100%',
    height: 180,
    alignSelf: 'center',
  },
  audioButton: {
    backgroundColor: '#E8D8F8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

});
