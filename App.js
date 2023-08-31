import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Button, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, getFirestore, orderBy, addDoc } from 'firebase/firestore'; // Import necessary Firebase functions
import { FontAwesome } from '@expo/vector-icons'; // Import the FontAwesome icon library
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { convertFirebaseTimeStampToJS } from './helpers/Functions';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default function App() {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    const db = getFirestore(); // Get a reference to Firestore
    const q = query(collection(db, 'messages'), orderBy('created', 'desc')); // Replace 'MESSAGES' with your collection name

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const tempMessages = [];
        querySnapshot.forEach((doc) => {

          const messageObject = {
            id: doc.id,
            name: doc.data().name,
            text: doc.data().text,
            created: convertFirebaseTimeStampToJS(doc.data().created)
          };

          tempMessages.push(messageObject);
        });
//        console.log('Temp messages length:', tempMessages.length);
        setMessages(tempMessages);
      } catch (error) {
        console.error('Error retrieving messages:', error);
      }

      return () => unsubscribe();
    });
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      return; // Don't send empty messages
    }

    try {
      const db = getFirestore();
      const newMessageObject = {
        name: senderName,
        text: newMessage,
        created: new Date(),
      };
      await addDoc(collection(db, 'messages'), newMessageObject);
      setNewMessage(''); // Clear the input field
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <ScrollView>
        {
          messages.map((message) => (
            <View style={styles.message} key={message.id}>
              <FontAwesome name="user" size={16} color="gray" style={styles.userIcon} />
              <Text>   Message from {message.name}:</Text>
              <Text>{message.text}</Text>
              <Text></Text>
              <Text style={styles.messageInfo}>{message.created}</Text>
            </View>
          ))
        }
      </ScrollView>
      <Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name..."
        value={senderName}
        onChangeText={(name) => setSenderName(name)}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your message..."
        value={newMessage}
        onChangeText={(text) => setNewMessage(text)}
      />
      <Button title="Send" onPress={sendMessage} />
      <Text></Text>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight, // To account for the status bar height
  },
  message: {
    flex: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  messageInfo: {
    fontSize: 12,
  },
  input: {
    width: '80%',
    height: 40,
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
  },
  userIcon: {
    position: 'absolute',
    marginRight: 8,
    top: 5,
    left: 5,
  },
});
