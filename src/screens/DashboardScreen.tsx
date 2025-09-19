import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StatusBar 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ProfessionalCard from '../components/ProfessionalCard';
import { AuthService, WeatherService, FarmService, MarketService } from '../services';
import { WeatherData } from '../services/WeatherService';
import ConfigService from '../config/ConfigService';
import FirebaseService from '../services/FirebaseService';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Log configuration status
      ConfigService.logConfiguration();
      
      // Test Firebase connection
      const isConnected = await FirebaseService.testConnection();
      setFirebaseConnected(isConnected);
      
      await loadWeatherData();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      setWeatherLoading(true);
      const data = await WeatherService.getCurrentWeather();
      setWeatherData(data);
    } catch (error) {
      console.error('Error loading weather data:', error);
      Alert.alert('Weather Error', 'Unable to load weather data. Using offline mode.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadWeatherData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const mockFarmData = {
    totalFields: 12,
    activeDevices: 24,
    cropHealth: 94,
    waterUsage: 2340,
    powerConsumption: 145,
    yieldProjection: 85.7,
    alerts: 3,
    tasks: 8
  };

  const mockMarketData = [
    { crop: 'Wheat', price: 2850, change: 5.2, trend: 'up' },
    { crop: 'Rice', price: 3200, change: -2.1, trend: 'down' },
    { crop: 'Corn', price: 1890, change: 8.7, trend: 'up' },
    { crop: 'Tomato', price: 4500, change: 12.3, trend: 'up' },
  ];

  const quickActions = [
    { 
      id: 'irrigation', 
      title: 'Irrigation', 
      icon: 'water', 
      color: '#2196F3',
      status: 'Active',
      action: () => Alert.alert('Irrigation', 'Irrigation system controls')
    },
    { 
      id: 'lighting', 
      title: 'Lighting', 
      icon: 'lightbulb', 
      color: '#FF9800',
      status: 'Scheduled',
      action: () => Alert.alert('Lighting', 'Lighting system controls')
    },
    { 
      id: 'fertilizer', 
      title: 'Fertilizer', 
      icon: 'leaf', 
      color: '#4CAF50',
      status: 'Pending',
      action: () => Alert.alert('Fertilizer', 'Fertilizer application controls')
    },
    { 
      id: 'monitoring', 
      title: 'Monitor', 
      icon: 'monitor-dashboard', 
      color: '#9C27B0',
      status: 'Online',
      action: () => Alert.alert('Monitoring', 'Real-time monitoring dashboard')
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading Dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.statusBar} 
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.text }]}>Good Morning</Text>
          <Text style={[styles.userName, { color: colors.textSecondary }]}>Smart Farmer</Text>
          <View style={styles.connectionStatus}>
            <Icon 
              name={firebaseConnected ? "cloud-check" : "cloud-off"} 
              size={12} 
              color={firebaseConnected ? colors.success : colors.error} 
            />
            <Text style={[styles.connectionText, { color: firebaseConnected ? colors.success : colors.error }]}>
              {firebaseConnected ? "Connected" : "Offline"}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.themeToggle, { backgroundColor: colors.border }]}
            onPress={toggleTheme}
          >
            <Icon 
              name={isDark ? 'weather-sunny' : 'weather-night'} 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: colors.border }]}
            onPress={() => Alert.alert('Notifications', 'You have 3 new alerts')}
          >
            <Icon name="bell" size={20} color={colors.text} />
            <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
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
        {/* Weather Card */}
        <ProfessionalCard
          title="Weather Conditions"
          subtitle="Real-time environmental data"
          icon="weather-partly-cloudy"
          iconColor={colors.info}
          gradient={false}
          style={styles.weatherCard}
        >
          <View style={styles.weatherContent}>
            {weatherLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <View style={styles.weatherMain}>
                  <Text style={[styles.temperature, { color: colors.text }]}>
                    {weatherData?.current?.temp || '--'}°C
                  </Text>
                  <View style={styles.weatherDetails}>
                    <View style={styles.weatherItem}>
                      <Icon name="water-percent" size={16} color={colors.info} />
                      <Text style={[styles.weatherValue, { color: colors.textSecondary }]}>
                        {weatherData?.current?.humidity || '--'}%
                      </Text>
                    </View>
                    <View style={styles.weatherItem}>
                      <Icon name="weather-windy" size={16} color={colors.info} />
                      <Text style={[styles.weatherValue, { color: colors.textSecondary }]}>
                        {weatherData?.current?.windSpeed || '--'} km/h
                      </Text>
                    </View>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecast}>
                  {weatherData?.forecast?.map((day, index) => (
                    <View key={`forecast-${day.date}-${index}`} style={[styles.forecastDay, { backgroundColor: colors.border }]}>
                      <Text style={[styles.forecastDayText, { color: colors.textSecondary }]}>{day.day}</Text>
                      <Icon 
                        name={day.condition === 'Clear' ? 'weather-sunny' : 
                              day.condition === 'Clouds' ? 'weather-cloudy' : 
                              day.condition === 'Rain' ? 'weather-rainy' : 'weather-partly-cloudy'} 
                        size={20} 
                        color={colors.warning} 
                      />
                      <Text style={[styles.forecastTemp, { color: colors.text }]}>{day.temp.max}°</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </ProfessionalCard>

        {/* Farm Metrics Grid */}
        <View style={styles.metricsGrid}>
          <ProfessionalCard
            title="Crop Health"
            value={`${mockFarmData?.cropHealth}%`}
            icon="leaf"
            iconColor={colors.success}
            change={2.5}
            changeType="increase"
            size="small"
            style={styles.metricCard}
          />
          <ProfessionalCard
            title="Active Devices"
            value={mockFarmData?.activeDevices}
            icon="devices"
            iconColor={colors.primary}
            change={8.3}
            changeType="increase"
            size="small"
            style={styles.metricCard}
          />
        </View>

        <View style={styles.metricsGrid}>
          <ProfessionalCard
            title="Water Usage"
            value={`${mockFarmData?.waterUsage}L`}
            icon="water"
            iconColor={colors.info}
            change={-5.1}
            changeType="decrease"
            size="small"
            style={styles.metricCard}
          />
          <ProfessionalCard
            title="Power Usage"
            value={`${mockFarmData?.powerConsumption}kW`}
            icon="lightning-bolt"
            iconColor={colors.warning}
            change={12.7}
            changeType="increase"
            size="small"
            style={styles.metricCard}
          />
        </View>

        {/* Quick Actions */}
        <ProfessionalCard
          title="Quick Actions"
          subtitle="Control your farm systems"
          icon="gesture-tap"
          iconColor={colors.primary}
        >
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id}
                style={[styles.actionButton, { backgroundColor: colors.border }]}
                onPress={action.action}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
                <Text style={[styles.actionStatus, { color: colors.textMuted }]}>{action.status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ProfessionalCard>

        {/* Market Prices */}
        <ProfessionalCard
          title="Market Prices"
          subtitle="Live commodity rates"
          icon="chart-line"
          iconColor={colors.success}
          headerRight={
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          }
        >
          {mockMarketData.map((item, index) => (
            <View key={`market-${index}`} style={styles.marketItem}>
              <View style={styles.marketLeft}>
                <Text style={[styles.cropName, { color: colors.text }]}>{item.crop}</Text>
                <Text style={[styles.cropPrice, { color: colors.textSecondary }]}>₹{item.price}/quintal</Text>
              </View>
              <View style={styles.marketRight}>
                <View style={[styles.trendIndicator, { 
                  backgroundColor: item.trend === 'up' ? colors.success + '20' : colors.error + '20' 
                }]}>
                  <Icon 
                    name={item.trend === 'up' ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={item.trend === 'up' ? colors.success : colors.error} 
                  />
                  <Text style={[styles.changeText, { 
                    color: item.trend === 'up' ? colors.success : colors.error 
                  }]}>
                    {Math.abs(item.change)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ProfessionalCard>

        {/* Farm Overview */}
        <ProfessionalCard
          title="Farm Overview"
          subtitle="Today's summary"
          icon="farm"
          iconColor={colors.accent}
          gradient={true}
        >
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{mockFarmData?.totalFields}</Text>
              <Text style={styles.overviewLabel}>Total Fields</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{mockFarmData?.tasks}</Text>
              <Text style={styles.overviewLabel}>Pending Tasks</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{mockFarmData?.alerts}</Text>
              <Text style={styles.overviewLabel}>Active Alerts</Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    marginTop: 2,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  weatherCard: {
    marginBottom: 20,
  },
  weatherContent: {
    marginTop: 12,
  },
  weatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '700',
  },
  weatherDetails: {
    alignItems: 'flex-end',
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weatherValue: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  forecast: {
    marginTop: 8,
  },
  forecastDay: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 70,
  },
  forecastDayText: {
    fontSize: 12,
    marginBottom: 6,
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    width: (width - 80) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionStatus: {
    fontSize: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  marketLeft: {
    flex: 1,
  },
  marketRight: {
    alignItems: 'flex-end',
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cropPrice: {
    fontSize: 14,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#FFFFFF80',
  },
  bottomSpacer: {
    height: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  connectionText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default DashboardScreen;
