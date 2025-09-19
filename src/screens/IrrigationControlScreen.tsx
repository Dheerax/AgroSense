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
import IrrigationService, { IrrigationStatus, IrrigationSchedule } from '../services/IrrigationService';

const IrrigationControlScreen = () => {
  const { colors, isDark } = useTheme();
  const [status, setStatus] = useState<IrrigationStatus | null>(null);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    initializeIrrigation();
    loadSchedules();
  }, []);

  const initializeIrrigation = async () => {
    try {
      setLoading(true);
      
      // Increase timeout to 20 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 20000)
      );
      
      const initPromise = IrrigationService.initializeSystem();
      
      // Race between initialization and timeout
      await Promise.race([initPromise, timeoutPromise]);
      
      // Listen to real-time status updates
      const unsubscribe = IrrigationService.onStatusChange((newStatus) => {
        setStatus(newStatus);
        setLoading(false);
      });

      // Load initial status with longer timeout
      try {
        const statusPromise = IrrigationService.getStatus();
        const currentStatus = await Promise.race([statusPromise, timeoutPromise]);
        setStatus(currentStatus);
      } catch (statusError) {
        console.warn('Failed to load initial status, using defaults');
        // Set default status if Firebase fails
        setStatus({
          isOn: false,
          lastUpdated: new Date().toISOString(),
          duration: 0,
          autoShutoff: false,
          esp32Connected: false,
          sensorData: {
            soilMoisture: 0,
            temperature: 0,
            humidity: 0
          }
        });
      }
      
      setLoading(false);
      return unsubscribe;
    } catch (error) {
      console.error('Failed to initialize irrigation:', error);
      setLoading(false);
      
      // Set offline mode with default status
      setStatus({
        isOn: false,
        lastUpdated: new Date().toISOString(),
        duration: 0,
        autoShutoff: false,
        esp32Connected: false,
        sensorData: {
          soilMoisture: 0,
          temperature: 0,
          humidity: 0
        }
      });
      
      Alert.alert(
        'Offline Mode', 
        'Firebase connection failed. You can view the interface but irrigation control requires internet connection. ESP32 may still be working.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadSchedules = async () => {
    try {
      const scheduleList = await IrrigationService.getSchedules();
      setSchedules(scheduleList);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const handleToggleIrrigation = async () => {
    if (!status) return;

    if (status.isOn) {
      // Turn off immediately
      await toggleIrrigation(false);
    } else {
      // Show duration selector for turning on
      setShowDurationModal(true);
    }
  };

  const toggleIrrigation = async (turnOn: boolean, duration?: number) => {
    setIsToggling(true);
    try {
      if (turnOn) {
        await IrrigationService.turnOn(duration || 30);
        Alert.alert(
          'Irrigation Started', 
          `Irrigation system turned ON for ${duration || 30} minutes`
        );
      } else {
        await IrrigationService.turnOff();
        Alert.alert('Irrigation Stopped', 'Irrigation system turned OFF');
      }
    } catch (error) {
      console.error('Toggle irrigation error:', error);
      Alert.alert('Error', 'Failed to control irrigation system');
    } finally {
      setIsToggling(false);
      setShowDurationModal(false);
    }
  };

  const handleEmergencyStop = () => {
    Alert.alert(
      'Emergency Stop',
      'Are you sure you want to immediately stop all irrigation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'STOP',
          style: 'destructive',
          onPress: async () => {
            try {
              await IrrigationService.emergencyStop();
              Alert.alert('Emergency Stop', 'All irrigation stopped immediately');
            } catch (error) {
              Alert.alert('Error', 'Failed to stop irrigation');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (!status) return colors.textMuted;
    if (!status.esp32Connected) return colors.error;
    return status.isOn ? colors.success : colors.textMuted;
  };

  const getStatusText = () => {
    if (!status) return 'Loading...';
    if (!status.esp32Connected) return 'ESP32 Offline';
    return status.isOn ? 'ON' : 'OFF';
  };

  const getRemainingTime = () => {
    if (!status?.isOn || !status?.scheduledShutoff) return null;
    
    const shutoffTime = new Date(status.scheduledShutoff);
    const now = new Date();
    const remainingMs = shutoffTime.getTime() - now.getTime();
    
    if (remainingMs <= 0) return 'Stopping...';
    
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return `${remainingMinutes} min remaining`;
  };

  const DurationModal = () => (
    <Modal
      visible={showDurationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDurationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Set Irrigation Duration
          </Text>
          
          <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
            How long should the irrigation run?
          </Text>
          
          <View style={styles.durationOptions}>
            {['15', '30', '45', '60', '90'].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  {
                    backgroundColor: selectedDuration === duration ? colors.primary : colors.border,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedDuration(duration)}
              >
                <Text
                  style={[
                    styles.durationText,
                    {
                      color: selectedDuration === duration ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={[styles.customDurationInput, { borderColor: colors.border, color: colors.text }]}
            value={selectedDuration}
            onChangeText={setSelectedDuration}
            placeholder="Custom duration (minutes)"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border }]}
              onPress={() => setShowDurationModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => toggleIrrigation(true, parseInt(selectedDuration))}
              disabled={isToggling}
            >
              {isToggling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Start</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Connecting to irrigation system...
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            // Force skip loading and set offline mode
            setLoading(false);
            setStatus({
              isOn: false,
              lastUpdated: new Date().toISOString(),
              duration: 0,
              autoShutoff: false,
              esp32Connected: false,
              sensorData: {
                soilMoisture: 0,
                temperature: 0,
                humidity: 0
              }
            });
            Alert.alert('Offline Mode', 'You can still view the interface, but irrigation control requires internet connection.');
          }}
        >
          <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
            Skip & Use Offline Mode
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Control Card */}
        <ProfessionalCard
          title="Irrigation Control"
          subtitle="Smart irrigation system management"
          icon="water"
          iconColor={colors.info}
          style={styles.controlCard}
        >
          {/* Status Display */}
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { color: colors.textMuted }]}>Status</Text>
                <View style={styles.statusValueRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                  <Text style={[styles.statusValue, { color: colors.text }]}>
                    {getStatusText()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.connectionInfo}>
                <Text style={[styles.statusLabel, { color: colors.textMuted }]}>ESP32</Text>
                <View style={styles.statusValueRow}>
                  <Icon
                    name={status?.esp32Connected ? 'wifi' : 'wifi-off'}
                    size={16}
                    color={status?.esp32Connected ? colors.success : colors.error}
                  />
                  <Text style={[styles.connectionText, { color: colors.text }]}>
                    {status?.esp32Connected ? 'Connected' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>
            
            {status?.isOn && getRemainingTime() && (
              <View style={[styles.remainingTimeContainer, { backgroundColor: colors.warning + '20' }]}>
                <Icon name="timer" size={16} color={colors.warning} />
                <Text style={[styles.remainingTimeText, { color: colors.warning }]}>
                  {getRemainingTime()}
                </Text>
              </View>
            )}
          </View>

          {/* Control Buttons */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[
                styles.mainButton,
                {
                  backgroundColor: status?.isOn ? colors.error : colors.success,
                },
              ]}
              onPress={handleToggleIrrigation}
              disabled={isToggling || !status?.esp32Connected}
            >
              {isToggling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon
                    name={status?.isOn ? 'stop' : 'play'}
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.mainButtonText}>
                    {status?.isOn ? 'STOP' : 'START'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.emergencyButton, { backgroundColor: colors.error }]}
              onPress={handleEmergencyStop}
              disabled={!status?.isOn}
            >
              <Icon name="alert-octagon" size={20} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>Emergency Stop</Text>
            </TouchableOpacity>
          </View>
        </ProfessionalCard>

        {/* Sensor Data Card */}
        {status?.sensorData && (
          <ProfessionalCard
            title="Sensor Readings"
            subtitle="Real-time environmental data"
            icon="chart-line"
            iconColor={colors.success}
            style={styles.sensorCard}
          >
            <View style={styles.sensorGrid}>
              <View style={styles.sensorItem}>
                <Icon name="water-percent" size={24} color={colors.info} />
                <Text style={[styles.sensorLabel, { color: colors.textMuted }]}>
                  Soil Moisture
                </Text>
                <Text style={[styles.sensorValue, { color: colors.text }]}>
                  {status.sensorData.soilMoisture}%
                </Text>
              </View>
              
              <View style={styles.sensorItem}>
                <Icon name="thermometer" size={24} color={colors.warning} />
                <Text style={[styles.sensorLabel, { color: colors.textMuted }]}>
                  Temperature
                </Text>
                <Text style={[styles.sensorValue, { color: colors.text }]}>
                  {status.sensorData.temperature}°C
                </Text>
              </View>
              
              <View style={styles.sensorItem}>
                <Icon name="water" size={24} color={colors.primary} />
                <Text style={[styles.sensorLabel, { color: colors.textMuted }]}>
                  Humidity
                </Text>
                <Text style={[styles.sensorValue, { color: colors.text }]}>
                  {status.sensorData.humidity}%
                </Text>
              </View>
            </View>
          </ProfessionalCard>
        )}

        {/* Quick Actions */}
        <ProfessionalCard
          title="Quick Actions"
          subtitle="Common irrigation tasks"
          icon="lightning-bolt"
          iconColor={colors.warning}
          style={styles.actionsCard}
        >
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.primary + '20' }]}
              onPress={() => toggleIrrigation(true, 15)}
            >
              <Icon name="timer-15" size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.primary }]}>
                15 min
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.success + '20' }]}
              onPress={() => toggleIrrigation(true, 30)}
            >
              <Icon name="timer-30" size={24} color={colors.success} />
              <Text style={[styles.quickActionText, { color: colors.success }]}>
                30 min
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.info + '20' }]}
              onPress={() => toggleIrrigation(true, 60)}
            >
              <Icon name="timer-60" size={24} color={colors.info} />
              <Text style={[styles.quickActionText, { color: colors.info }]}>
                1 hour
              </Text>
            </TouchableOpacity>
          </View>
        </ProfessionalCard>
      </ScrollView>

      <DurationModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  controlCard: {
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusInfo: {
    flex: 1,
  },
  connectionInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  remainingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  remainingTimeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emergencyButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sensorCard: {
    marginBottom: 16,
  },
  sensorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sensorItem: {
    alignItems: 'center',
    flex: 1,
  },
  sensorLabel: {
    fontSize: 10,
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionsCard: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customDurationInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default IrrigationControlScreen;