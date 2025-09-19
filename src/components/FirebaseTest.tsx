import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const FirebaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [firestoreStatus, setFirestoreStatus] = useState('Checking...');

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Test Auth
      console.log('Testing Firebase Auth...');
      const currentUser = auth().currentUser;
      setAuthStatus(currentUser ? 'User signed in' : 'No user signed in (Normal)');

      // Test Firestore
      console.log('Testing Firestore...');
      const testDoc = await firestore()
        .collection('test')
        .doc('connection')
        .set({
          message: 'Firebase connection successful!',
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
      
      setFirestoreStatus('✅ Firestore Connected Successfully!');
      setConnectionStatus('🎉 Firebase Connected Successfully!');

      Alert.alert(
        'Firebase Test',
        'All Firebase services are working correctly!',
        [{ text: 'Great!', style: 'default' }]
      );

    } catch (error: any) {
      console.error('Firebase connection error:', error);
      setConnectionStatus('❌ Connection Failed');
      setAuthStatus('❌ Auth Failed');
      setFirestoreStatus('❌ Firestore Failed');
      
      Alert.alert(
        'Firebase Test Failed',
        `Error: ${error.message}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Overall Status:</Text>
        <Text style={styles.statusText}>{connectionStatus}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Authentication:</Text>
        <Text style={styles.statusText}>{authStatus}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Firestore Database:</Text>
        <Text style={styles.statusText}>{firestoreStatus}</Text>
      </View>

      <Text style={styles.note}>
        Check the console for detailed logs
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  note: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default FirebaseTest;
