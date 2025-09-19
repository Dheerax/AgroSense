import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ProfessionalCard from '../components/ProfessionalCard';

const { width } = Dimensions.get('window');

const ControlScreen = () => {
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState('zone1');
  const [automationMode, setAutomationMode] = useState(true);

  // Control states
  const [irrigationStates, setIrrigationStates] = useState({
    zone1: { active: true, flow: 75, pressure: 2.5, timer: 45 },
    zone2: { active: false, flow: 0, pressure: 1.8, timer: 0 },
    zone3: { active: true, flow: 60, pressure: 2.2, timer: 30 },
    zone4: { active: false, flow: 0, pressure: 1.5, timer: 0 },
  });

  const [equipmentStates, setEquipmentStates] = useState({
    pump1: { active: true, rpm: 1200, efficiency: 87, temperature: 65 },
    pump2: { active: false, rpm: 0, efficiency: 0, temperature: 32 },
    fertilizer: { active: true, concentration: 15, flow: 2.5, tank: 75 },
    pesticide: { active: false, concentration: 0, flow: 0, tank: 45 },
  });

  const zones = [
    { id: 'zone1', name: 'Field A - Tomatoes', area: '2.5 ha', status: 'active', color: '#4CAF50' },
    { id: 'zone2', name: 'Field B - Onions', area: '1.8 ha', status: 'idle', color: '#FF9800' },
    { id: 'zone3', name: 'Field C - Carrots', area: '3.2 ha', status: 'active', color: '#2196F3' },
    { id: 'zone4', name: 'Field D - Potatoes', area: '2.0 ha', status: 'maintenance', color: '#F44336' },
  ];

  const quickActions = [
    { 
      id: 'start_all', 
      title: 'Start All Zones', 
      icon: 'play-circle', 
      color: '#4CAF50',
      description: 'Begin irrigation for all zones'
    },
    { 
      id: 'stop_all', 
      title: 'Emergency Stop', 
      icon: 'stop-circle', 
      color: '#F44336',
      description: 'Immediately stop all operations'
    },
    { 
      id: 'schedule', 
      title: 'Schedule Tasks', 
      icon: 'calendar-clock', 
      color: '#2196F3',
      description: 'Set automated schedules'
    },
    { 
      id: 'diagnostics', 
      title: 'Run Diagnostics', 
      icon: 'stethoscope', 
      color: '#9C27B0',
      description: 'Check system health'
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Low Water Pressure',
      message: 'Zone 2 pressure below optimal threshold',
      time: '5 min ago',
      priority: 'medium',
      action: 'Check Pump'
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'Fertilizer system due for service in 3 days',
      time: '1 hour ago',
      priority: 'low',
      action: 'Schedule'
    },
    {
      id: 3,
      type: 'success',
      title: 'Task Completed',
      message: 'Zone 1 irrigation cycle finished successfully',
      time: '2 hours ago',
      priority: 'info',
      action: 'View Report'
    },
  ];

  const automationRules = [
    {
      id: 1,
      name: 'Morning Irrigation',
      trigger: 'Time: 6:00 AM',
      action: 'Start irrigation for 30 minutes',
      status: 'active',
      zones: ['zone1', 'zone3']
    },
    {
      id: 2,
      name: 'Soil Moisture Response',
      trigger: 'Moisture < 30%',
      action: 'Start irrigation until 70%',
      status: 'active',
      zones: ['zone1', 'zone2', 'zone3']
    },
    {
      id: 3,
      name: 'Weather Protection',
      trigger: 'Rain detected',
      action: 'Stop all irrigation',
      status: 'active',
      zones: ['all']
    },
    {
      id: 4,
      name: 'Evening Fertilization',
      trigger: 'Time: 6:00 PM',
      action: 'Apply liquid fertilizer',
      status: 'inactive',
      zones: ['zone1']
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const toggleIrrigation = (zoneId: string) => {
    setIrrigationStates(prev => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId as keyof typeof prev],
        active: !prev[zoneId as keyof typeof prev].active,
        timer: !prev[zoneId as keyof typeof prev].active ? 30 : 0
      }
    }));
  };

  const toggleEquipment = (equipmentId: string) => {
    setEquipmentStates(prev => ({
      ...prev,
      [equipmentId]: {
        ...prev[equipmentId as keyof typeof prev],
        active: !prev[equipmentId as keyof typeof prev].active
      }
    }));
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'start_all':
        Alert.alert('Start All Zones', 'This will begin irrigation for all active zones. Continue?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start', onPress: () => Alert.alert('Success', 'All zones started') }
        ]);
        break;
      case 'stop_all':
        Alert.alert('Emergency Stop', 'This will immediately stop all operations. Continue?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Stop', style: 'destructive', onPress: () => Alert.alert('Stopped', 'All operations stopped') }
        ]);
        break;
      case 'schedule':
        Alert.alert('Schedule Tasks', 'Opening scheduling interface...');
        break;
      case 'diagnostics':
        Alert.alert('System Diagnostics', 'Running comprehensive system check...');
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'idle': return colors.warning;
      case 'maintenance': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      case 'success': return colors.success;
      case 'info': return colors.info;
      default: return colors.textMuted;
    }
  };

  const ZoneButton = ({ zone }: { zone: any }) => (
    <TouchableOpacity
      style={[
        styles.zoneButton,
        {
          backgroundColor: selectedZone === zone.id ? zone.color + '20' : colors.border,
          borderColor: selectedZone === zone.id ? zone.color : colors.border,
        }
      ]}
      onPress={() => setSelectedZone(zone.id)}
    >
      <View style={styles.zoneHeader}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(zone.status) }]} />
        <Text style={[
          styles.zoneName,
          {
            color: selectedZone === zone.id ? zone.color : colors.text,
            fontWeight: selectedZone === zone.id ? '600' : '500'
          }
        ]}>
          {zone.name}
        </Text>
      </View>
      <Text style={[styles.zoneArea, { color: colors.textMuted }]}>{zone.area}</Text>
      <Text style={[styles.zoneStatus, { 
        color: getStatusColor(zone.status),
        textTransform: 'capitalize'
      }]}>
        {zone.status}
      </Text>
    </TouchableOpacity>
  );

  const IrrigationControl = ({ zone }: { zone: any }) => {
    const state = irrigationStates[zone.id as keyof typeof irrigationStates];
    
    return (
      <View style={[styles.controlCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.controlHeader}>
          <View style={styles.controlTitle}>
            <Icon name="water" size={20} color={colors.primary} />
            <Text style={[styles.controlName, { color: colors.text }]}>Irrigation Control</Text>
          </View>
          <Switch
            value={state.active}
            onValueChange={() => toggleIrrigation(zone.id)}
            trackColor={{ false: colors.border, true: colors.success + '40' }}
            thumbColor={state.active ? colors.success : colors.textMuted}
          />
        </View>
        
        {state.active && (
          <View style={styles.controlDetails}>
            <View style={styles.controlMetric}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Flow Rate</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{state.flow}%</Text>
            </View>
            <View style={styles.controlMetric}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Pressure</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{state.pressure} bar</Text>
            </View>
            <View style={styles.controlMetric}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Timer</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{state.timer} min</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const EquipmentCard = ({ equipment, equipmentId }: { equipment: any, equipmentId: string }) => (
    <View style={[styles.equipmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.equipmentHeader}>
        <View style={styles.equipmentTitle}>
          <Icon 
            name={equipmentId.includes('pump') ? 'pump' : equipmentId === 'fertilizer' ? 'spray' : 'bug'} 
            size={18} 
            color={equipment.active ? colors.success : colors.textMuted} 
          />
          <Text style={[styles.equipmentName, { color: colors.text }]}>
            {equipmentId.charAt(0).toUpperCase() + equipmentId.slice(1)}
          </Text>
        </View>
        <Switch
          value={equipment.active}
          onValueChange={() => toggleEquipment(equipmentId)}
          trackColor={{ false: colors.border, true: colors.success + '40' }}
          thumbColor={equipment.active ? colors.success : colors.textMuted}
        />
      </View>
      
      {equipment.active && (
        <View style={styles.equipmentMetrics}>
          {Object.entries(equipment).map(([key, value]) => {
            if (key === 'active') return null;
            return (
              <View key={key} style={styles.equipmentMetric}>
                <Text style={[styles.equipmentMetricLabel, { color: colors.textMuted }]}>
                  {key.toUpperCase()}
                </Text>
                <Text style={[styles.equipmentMetricValue, { color: colors.text }]}>
                  {typeof value === 'number' ? value : String(value)}
                  {key === 'rpm' ? ' RPM' : 
                   key === 'efficiency' ? '%' : 
                   key === 'temperature' ? '°C' : 
                   key === 'concentration' ? '%' : 
                   key === 'flow' ? ' L/min' : 
                   key === 'tank' ? '%' : ''}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const AlertCard = ({ alert }: { alert: any }) => (
    <TouchableOpacity 
      style={[styles.alertCard, { 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        borderLeftColor: getAlertColor(alert.type),
        borderLeftWidth: 4,
      }]}
      onPress={() => Alert.alert(alert.title, alert.message)}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertTitle}>
          <Icon 
            name={alert.type === 'warning' ? 'alert' : 
                  alert.type === 'error' ? 'alert-circle' : 
                  alert.type === 'success' ? 'check-circle' : 'information'} 
            size={16} 
            color={getAlertColor(alert.type)} 
          />
          <Text style={[styles.alertTitleText, { color: colors.text }]}>{alert.title}</Text>
        </View>
        <Text style={[styles.alertTime, { color: colors.textMuted }]}>{alert.time}</Text>
      </View>
      <Text style={[styles.alertMessage, { color: colors.textMuted }]}>{alert.message}</Text>
      <TouchableOpacity style={[styles.alertAction, { backgroundColor: getAlertColor(alert.type) + '20' }]}>
        <Text style={[styles.alertActionText, { color: getAlertColor(alert.type) }]}>{alert.action}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const AutomationRule = ({ rule }: { rule: any }) => (
    <View style={[styles.ruleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.ruleHeader}>
        <View style={styles.ruleTitle}>
          <Icon 
            name={rule.status === 'active' ? 'robot' : 'robot-off'} 
            size={16} 
            color={rule.status === 'active' ? colors.success : colors.textMuted} 
          />
          <Text style={[styles.ruleName, { color: colors.text }]}>{rule.name}</Text>
        </View>
        <View style={[styles.ruleStatus, { 
          backgroundColor: rule.status === 'active' ? colors.success + '20' : colors.textMuted + '20' 
        }]}>
          <Text style={[styles.ruleStatusText, { 
            color: rule.status === 'active' ? colors.success : colors.textMuted 
          }]}>
            {rule.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={[styles.ruleTrigger, { color: colors.textMuted }]}>Trigger: {rule.trigger}</Text>
      <Text style={[styles.ruleAction, { color: colors.textMuted }]}>Action: {rule.action}</Text>
      <Text style={[styles.ruleZones, { color: colors.primary }]}>
        Zones: {Array.isArray(rule.zones) ? rule.zones.join(', ') : rule.zones}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.statusBar} 
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Control Center</Text>
          <View style={styles.headerControls}>
            <View style={[styles.automationToggle, { backgroundColor: colors.border }]}>
              <Text style={[styles.automationLabel, { color: colors.text }]}>Auto</Text>
              <Switch
                value={automationMode}
                onValueChange={setAutomationMode}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={automationMode ? colors.primary : colors.textMuted}
              />
            </View>
            <TouchableOpacity style={[styles.emergencyButton, { backgroundColor: colors.error + '20' }]}>
              <Icon name="alert-octagon" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Real-time farm equipment control and automation
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Actions */}
        <ProfessionalCard
          title="Quick Actions"
          subtitle="Common control operations"
          icon="lightning-bolt"
          iconColor={colors.warning}
        >
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: colors.border }]}
                onPress={() => handleQuickAction(action.id)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionTitle, { color: colors.text }]}>{action.title}</Text>
                <Text style={[styles.quickActionDesc, { color: colors.textMuted }]}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ProfessionalCard>

        {/* Zone Selection */}
        <ProfessionalCard
          title="Field Zones"
          subtitle="Select zone to control"
          icon="map"
          iconColor={colors.primary}
        >
          <View style={styles.zonesGrid}>
            {zones.map((zone) => (
              <ZoneButton key={zone.id} zone={zone} />
            ))}
          </View>
        </ProfessionalCard>

        {/* Zone Controls */}
        {selectedZone && (
          <ProfessionalCard
            title={`${zones.find(z => z.id === selectedZone)?.name} Controls`}
            subtitle="Direct equipment control"
            icon="cog"
            iconColor={colors.info}
          >
            <IrrigationControl zone={zones.find(z => z.id === selectedZone)} />
          </ProfessionalCard>
        )}

        {/* Equipment Status */}
        <ProfessionalCard
          title="Equipment Status"
          subtitle="Monitor and control farm equipment"
          icon="tools"
          iconColor={colors.success}
        >
          <View style={styles.equipmentGrid}>
            {Object.entries(equipmentStates).map(([equipmentId, equipment]) => (
              <EquipmentCard key={equipmentId} equipment={equipment} equipmentId={equipmentId} />
            ))}
          </View>
        </ProfessionalCard>

        {/* System Alerts */}
        <ProfessionalCard
          title="System Alerts"
          subtitle="Recent notifications and warnings"
          icon="bell"
          iconColor={colors.warning}
          headerRight={
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.alertsContainer}>
            {systemAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </View>
        </ProfessionalCard>

        {/* Automation Rules */}
        <ProfessionalCard
          title="Automation Rules"
          subtitle="Smart farming automation settings"
          icon="robot"
          iconColor={colors.primary}
          headerRight={
            <TouchableOpacity>
              <Text style={[styles.addRuleText, { color: colors.primary }]}>Add Rule</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.rulesContainer}>
            {automationRules.map((rule) => (
              <AutomationRule key={rule.id} rule={rule} />
            ))}
          </View>
        </ProfessionalCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  automationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  automationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  emergencyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  quickActionDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  zoneButton: {
    width: (width - 60) / 2,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  zoneName: {
    fontSize: 12,
    fontWeight: '500',
  },
  zoneArea: {
    fontSize: 10,
    marginBottom: 4,
  },
  zoneStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  controlCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  controlDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  equipmentGrid: {
    marginTop: 12,
  },
  equipmentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  equipmentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  equipmentMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  equipmentMetric: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentMetricLabel: {
    fontSize: 9,
    marginBottom: 2,
  },
  equipmentMetricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertsContainer: {
    marginTop: 12,
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTitleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  alertTime: {
    fontSize: 11,
  },
  alertMessage: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  alertAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  alertActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rulesContainer: {
    marginTop: 12,
  },
  ruleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  ruleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ruleStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  ruleTrigger: {
    fontSize: 12,
    marginBottom: 4,
  },
  ruleAction: {
    fontSize: 12,
    marginBottom: 4,
  },
  ruleZones: {
    fontSize: 11,
    fontWeight: '500',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addRuleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ControlScreen;
