import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ProfessionalCard from '../components/ProfessionalCard';
import HTTPIrrigationService, { IrrigationStatus } from '../services/HTTPIrrigationService';

const HTTPIrrigationControlScreen = () => {
  const { colors, isDark } = useTheme();
  const [status, setStatus] = useState<IrrigationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [showIPModal, setShowIPModal] = useState(false);
  const [esp32IP, setEsp32IP] = useState('192.168.4.1');
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    initializeIrrigation();
  }, []);

  const initializeIrrigation = async () => {
    try {
      setLoading(true);
      
      // Set a 15-second timeout for initialization
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Initialization timeout')), 15000)
      );
      
      const initPromise = HTTPIrrigationService.initializeSystem();
      
      // Race between initialization and timeout
      await Promise.race([initPromise, timeoutPromise]);
      
      // Listen to real-time status updates
      const unsubscribe = HTTPIrrigationService.onStatusChange((newStatus) => {
        setStatus(newStatus);
        setLoading(false);
      });
      
      // If we get here, initialization succeeded
      console.log('✅ Initialization completed');
      
      // Cleanup function
      return () => {
        unsubscribe();
        HTTPIrrigationService.stopStatusPolling();
      };
    } catch (error) {
      console.error('Initialization failed:', error);
      setLoading(false);
      
      // Set a default offline status
      setStatus({
        isOn: false,
        lastUpdated: new Date().toISOString(),
        duration: 0,
        autoShutoff: true,
        esp32Connected: false,
      });
      
      // Show setup modal after a short delay
      setTimeout(() => {
        Alert.alert(
          'ESP32 Not Connected',
          'Could not connect to ESP32. Please check:\n\n1. ESP32 is powered on\n2. ESP32 code is uploaded\n3. Both devices on same WiFi\n4. Set IP manually if needed',
          [
            { text: 'Enter IP Manually', onPress: () => setShowIPModal(true) },
            { text: 'Try Again', onPress: () => initializeIrrigation() },
            { text: 'Continue Offline', style: 'cancel' }
          ]
        );
      }, 500);
    }
  };

  const handleManualIPSetup = async () => {
    if (!esp32IP.trim()) {
      Alert.alert('Error', 'Please enter a valid IP address');
      return;
    }

    try {
      setLoading(true);
      HTTPIrrigationService.setESP32IP(esp32IP.trim());
      
      // Test connection
      const isConnected = await HTTPIrrigationService.checkESP32Connection();
      if (isConnected) {
        setShowIPModal(false);
        Alert.alert('Success', 'Connected to ESP32 successfully!');
        
        // Start listening to updates
        const unsubscribe = HTTPIrrigationService.onStatusChange((newStatus) => {
          setStatus(newStatus);
          setLoading(false);
        });
      } else {
        Alert.alert('Error', 'Could not connect to ESP32 at this IP address');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to ESP32');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverESP32 = async () => {
    try {
      setIsDiscovering(true);
      const discoveredIP = await HTTPIrrigationService.discoverESP32();
      
      if (discoveredIP) {
        setEsp32IP(discoveredIP);
        Alert.alert('ESP32 Found!', `Found ESP32 at ${discoveredIP}`);
      } else {
        Alert.alert('Not Found', 'No ESP32 devices found on network');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to discover ESP32');
    } finally {
      setIsDiscovering(false);
    }
  };

  const toggleIrrigation = async () => {
    if (!status) return;
    
    setIsToggling(true);
    try {
      if (status.isOn) {
        await HTTPIrrigationService.turnOff();
      } else {
        setShowDurationModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle irrigation system');
    } finally {
      setIsToggling(false);
    }
  };

  const startIrrigation = async () => {
    const duration = parseInt(selectedDuration);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    setIsToggling(true);
    try {
      await HTTPIrrigationService.turnOn(duration);
      setShowDurationModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to start irrigation');
    } finally {
      setIsToggling(false);
    }
  };

  const handleEmergencyStop = async () => {
    Alert.alert(
      'Emergency Stop',
      'This will immediately stop all irrigation. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'STOP',
          style: 'destructive',
          onPress: async () => {
            try {
              await HTTPIrrigationService.emergencyStop();
            } catch (error) {
              Alert.alert('Error', 'Failed to stop irrigation');
            }
          },
        },
      ]
    );
  };

  const toggleAutoMode = async () => {
    if (!status) return;
    
    try {
      await HTTPIrrigationService.setAutoMode(!status.autoShutoff);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle auto mode');
    }
  };

  const getConnectionStatus = () => {
    if (!status) return { color: colors.error, text: 'Disconnected', icon: 'wifi-off' };
    if (status.esp32Connected) return { color: colors.success, text: 'Connected', icon: 'wifi' };
    return { color: colors.warning, text: 'Connecting...', icon: 'wifi-strength-1' };
  };

  const getSensorStatus = () => {
    if (!status?.sensorData) return { color: colors.text, text: 'No Data', value: 'N/A' };
    
    const moisture = status.moisture || 'unknown';
    const sensorValue = status.sensorValue || 0;
    
    return {
      color: moisture === 'wet' ? colors.info : colors.warning,
      text: moisture === 'wet' ? 'Moist' : 'Dry',
      value: sensorValue.toString()
    };
  };

  const connectionStatus = getConnectionStatus();
  const sensorStatus = getSensorStatus();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Connecting to ESP32...</Text>
          <Text style={[styles.loadingText, { color: colors.textSecondary, textAlign: 'center' }]}>
            Tip: Connect your phone to Wi‑Fi "ESP32_Irrigation" (password 12345678) then use IP 192.168.4.1
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Irrigation Control
          </Text>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowIPModal(true)}
          >
            <Icon name="cog" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        <ProfessionalCard title="Connection Status">
          <View style={styles.statusRow}>
            <Icon name={connectionStatus.icon} size={24} color={connectionStatus.color} />
            <Text style={[styles.statusText, { color: connectionStatus.color }]}>
              {connectionStatus.text}
            </Text>
            {esp32IP && (
              <Text style={[styles.ipText, { color: colors.textSecondary }]}>
                {esp32IP}
              </Text>
            )}
          </View>
        </ProfessionalCard>

        {/* Main Control */}
        <ProfessionalCard title="Irrigation Control">
          <View style={styles.controlSection}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                { backgroundColor: status?.isOn ? colors.success : colors.textSecondary }
              ]} />
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                {status?.isOn ? 'IRRIGATION ON' : 'IRRIGATION OFF'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.mainButton,
                {
                  backgroundColor: status?.isOn ? colors.error : colors.success,
                  opacity: isToggling ? 0.6 : 1,
                }
              ]}
              onPress={toggleIrrigation}
              disabled={isToggling || !status?.esp32Connected}
            >
              {isToggling ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Icon
                    name={status?.isOn ? 'stop' : 'play'}
                    size={28}
                    color="white"
                  />
                  <Text style={styles.buttonText}>
                    {status?.isOn ? 'STOP' : 'START'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ProfessionalCard>

        {/* Sensor Data */}
        <ProfessionalCard title="Sensor Status">
          <View style={styles.sensorGrid}>
            <View style={styles.sensorItem}>
              <Icon name="water" size={24} color={sensorStatus.color} />
              <Text style={[styles.sensorLabel, { color: colors.textSecondary }]}>
                Soil Moisture
              </Text>
              <Text style={[styles.sensorValue, { color: sensorStatus.color }]}>
                {sensorStatus.text}
              </Text>
              <Text style={[styles.sensorRaw, { color: colors.textSecondary }]}>
                Raw: {sensorStatus.value}
              </Text>
            </View>
            
            <View style={styles.sensorItem}>
              <Icon name="cog" size={24} color={colors.text} />
              <Text style={[styles.sensorLabel, { color: colors.textSecondary }]}>
                Control Mode
              </Text>
              <Text style={[styles.sensorValue, { color: colors.text }]}>
                {status?.manualMode ? 'Manual' : 'Auto'}
              </Text>
              <Switch
                value={!status?.manualMode}
                onValueChange={toggleAutoMode}
                thumbColor={colors.primary}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
              />
            </View>
          </View>
        </ProfessionalCard>

        {/* Quick Actions */}
        <ProfessionalCard title="Quick Actions">
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.warning }]}
              onPress={handleEmergencyStop}
            >
              <Icon name="stop-circle" size={24} color="white" />
              <Text style={styles.quickButtonText}>Emergency Stop</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: colors.info }]}
              onPress={() => HTTPIrrigationService.getStatus()}
            >
              <Icon name="refresh" size={24} color="white" />
              <Text style={styles.quickButtonText}>Refresh Status</Text>
            </TouchableOpacity>
          </View>
        </ProfessionalCard>

        {/* System Info */}
        {status && (
          <ProfessionalCard title="System Information">
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Last Updated
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {status.lastUpdated ? new Date(status.lastUpdated).toLocaleTimeString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Threshold
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {status.threshold || 'N/A'}
                </Text>
              </View>
            </View>
          </ProfessionalCard>
        )}
      </ScrollView>

      {/* Duration Modal */}
      <Modal
        visible={showDurationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Set Irrigation Duration
            </Text>
            
            <View style={styles.durationInput}>
              <TextInput
                style={[styles.textInput, { 
                  borderColor: colors.border, 
                  color: colors.text,
                  backgroundColor: colors.background
                }]}
                value={selectedDuration}
                onChangeText={setSelectedDuration}
                placeholder="Duration in minutes"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowDurationModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={startIrrigation}
                disabled={isToggling}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  Start
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* IP Setup Modal */}
      <Modal
        visible={showIPModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIPModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ESP32 Configuration
            </Text>
            
            <View style={styles.ipInputSection}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                ESP32 IP Address:
              </Text>
              <TextInput
                style={[styles.textInput, { 
                  borderColor: colors.border, 
                  color: colors.text,
                  backgroundColor: colors.background
                }]}
                value={esp32IP}
                onChangeText={setEsp32IP}
                placeholder="192.168.1.100"
                placeholderTextColor={colors.textSecondary}
              />
              
              <TouchableOpacity
                style={[styles.discoverButton, { backgroundColor: colors.info }]}
                onPress={handleDiscoverESP32}
                disabled={isDiscovering}
              >
                {isDiscovering ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Icon name="magnify" size={20} color="white" />
                    <Text style={styles.discoverButtonText}>Auto Discover</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowIPModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleManualIPSetup}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  Connect
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 12,
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  ipText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  controlSection: {
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sensorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sensorItem: {
    alignItems: 'center',
    flex: 1,
  },
  sensorLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  sensorRaw: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  quickButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  durationInput: {
    marginBottom: 20,
  },
  ipInputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  discoverButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HTTPIrrigationControlScreen;