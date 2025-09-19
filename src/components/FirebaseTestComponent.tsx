import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FirebaseService from '../services/FirebaseService';
import { useTheme } from '../context/ThemeContext';

const FirebaseTest = () => {
  const { colors } = useTheme();
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Test if Firebase is ready
      if (FirebaseService.isReady()) {
        setConnectionStatus('✅ Firebase Connected');
        
        // Test writing data
        const db = FirebaseService.getDatabase();
        await db.ref('test_connection').set({
          timestamp: new Date().toISOString(),
          status: 'connected',
          message: 'Firebase is working!'
        });
        
        // Test reading data
        const snapshot = await db.ref('test_connection').once('value');
        setTestData(snapshot.val());
        
      } else {
        setConnectionStatus('❌ Firebase Not Ready');
      }
    } catch (error) {
      console.error('Firebase test error:', error);
      setConnectionStatus('❌ Connection Failed: ' + error.message);
    }
  };

  const testIrrigationPaths = async () => {
    try {
      const db = FirebaseService.getDatabase();
      
      // Test irrigation status path
      await db.ref('irrigation_status').set({
        isOn: false,
        lastUpdated: new Date().toISOString(),
        esp32Connected: false,
        sensorData: {
          soilMoisture: 45,
          temperature: 25,
          humidity: 60
        }
      });
      
      setConnectionStatus('✅ Firebase + Irrigation Paths Ready!');
    } catch (error) {
      setConnectionStatus('❌ Irrigation Test Failed: ' + error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Firebase Connection Test</Text>
      
      <Text style={[styles.status, { color: colors.text }]}>
        Status: {connectionStatus}
      </Text>
      
      {testData && (
        <View style={styles.dataContainer}>
          <Text style={[styles.dataTitle, { color: colors.text }]}>Test Data:</Text>
          <Text style={[styles.dataText, { color: colors.textMuted }]}>
            {JSON.stringify(testData, null, 2)}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={testFirebaseConnection}
      >
        <Text style={styles.buttonText}>Test Firebase Connection</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.success }]}
        onPress={testIrrigationPaths}
      >
        <Text style={styles.buttonText}>Test Irrigation Paths</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  dataContainer: {
    marginVertical: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FirebaseTest;