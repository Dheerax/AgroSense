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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ProfessionalCard from '../components/ProfessionalCard';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const { colors, isDark } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('yield');
  const [refreshing, setRefreshing] = useState(false);

  const timeframes = [
    { id: '7d', label: '7 Days', icon: 'calendar-week' },
    { id: '30d', label: '30 Days', icon: 'calendar-month' },
    { id: '90d', label: '90 Days', icon: 'calendar-range' },
    { id: '1y', label: '1 Year', icon: 'calendar' },
  ];

  const metrics = [
    { id: 'yield', label: 'Yield', icon: 'sprout', color: '#4CAF50' },
    { id: 'profit', label: 'Profit', icon: 'currency-inr', color: '#2196F3' },
    { id: 'efficiency', label: 'Efficiency', icon: 'speedometer', color: '#FF9800' },
    { id: 'quality', label: 'Quality', icon: 'star', color: '#9C27B0' },
  ];

  const kpiData = [
    {
      title: 'Total Revenue',
      value: '₹2,45,000',
      change: '+18.5%',
      trend: 'up',
      icon: 'currency-inr',
      color: '#4CAF50',
      subtitle: 'This month'
    },
    {
      title: 'Crop Yield',
      value: '3.2 tons',
      change: '+12.3%',
      trend: 'up',
      icon: 'sprout',
      color: '#2196F3',
      subtitle: 'Per hectare'
    },
    {
      title: 'Operating Cost',
      value: '₹89,500',
      change: '-7.2%',
      trend: 'down',
      icon: 'credit-card',
      color: '#FF5722',
      subtitle: 'This month'
    },
    {
      title: 'Profit Margin',
      value: '63.5%',
      change: '+5.8%',
      trend: 'up',
      icon: 'trending-up',
      color: '#9C27B0',
      subtitle: 'Current ratio'
    },
  ];

  const analyticsInsights = [
    {
      title: 'Peak Performance',
      subtitle: 'Tomato field showing 25% above average yield',
      icon: 'trophy',
      color: '#FFD700',
      priority: 'high',
      action: 'View Details'
    },
    {
      title: 'Cost Optimization',
      subtitle: 'Fertilizer usage can be reduced by 15%',
      icon: 'lightbulb',
      color: '#4CAF50',
      priority: 'medium',
      action: 'Optimize'
    },
    {
      title: 'Weather Impact',
      subtitle: 'Recent rainfall boosted soil moisture by 30%',
      icon: 'weather-rainy',
      color: '#2196F3',
      priority: 'info',
      action: 'Monitor'
    },
    {
      title: 'Market Trend',
      subtitle: 'Vegetable prices expected to rise next week',
      icon: 'chart-line',
      color: '#FF9800',
      priority: 'urgent',
      action: 'Plan Sale'
    },
  ];

  const performanceMetrics = [
    {
      category: 'Field A - Tomatoes',
      metrics: {
        yield: { value: '4.2 tons/ha', change: '+15%', status: 'excellent' },
        quality: { value: '92%', change: '+3%', status: 'good' },
        cost: { value: '₹28,500/ha', change: '-5%', status: 'optimized' },
        profit: { value: '₹65,000/ha', change: '+22%', status: 'excellent' }
      }
    },
    {
      category: 'Field B - Onions',
      metrics: {
        yield: { value: '3.8 tons/ha', change: '+8%', status: 'good' },
        quality: { value: '87%', change: '+1%', status: 'good' },
        cost: { value: '₹22,000/ha', change: '-3%', status: 'optimized' },
        profit: { value: '₹42,000/ha', change: '+12%', status: 'good' }
      }
    },
    {
      category: 'Field C - Carrots',
      metrics: {
        yield: { value: '2.9 tons/ha', change: '-2%', status: 'attention' },
        quality: { value: '85%', change: '-1%', status: 'average' },
        cost: { value: '₹19,500/ha', change: '+2%', status: 'monitor' },
        profit: { value: '₹35,000/ha', change: '+5%', status: 'good' }
      }
    },
  ];

  const chartData = {
    '7d': [65, 78, 82, 75, 88, 92, 85],
    '30d': [70, 75, 80, 85, 82, 88, 90, 85, 92, 88, 95, 90, 85, 88, 92, 89, 87, 90, 93, 88, 85, 87, 90, 92, 88, 85, 87, 90, 92, 88],
    '90d': Array.from({ length: 90 }, (_, i) => 70 + Math.random() * 25),
    '1y': Array.from({ length: 365 }, (_, i) => 65 + Math.random() * 30),
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return colors.success;
      case 'good': return colors.info;
      case 'average': return colors.warning;
      case 'attention': return colors.error;
      case 'optimized': return colors.primary;
      case 'monitor': return colors.warning;
      default: return colors.textMuted;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.info;
      case 'info': return colors.primary;
      default: return colors.textMuted;
    }
  };

  const TimeframeButton = ({ timeframe }: { timeframe: any }) => (
    <TouchableOpacity
      style={[
        styles.timeframeButton,
        {
          backgroundColor: selectedTimeframe === timeframe.id ? colors.primary + '20' : colors.border,
          borderColor: selectedTimeframe === timeframe.id ? colors.primary : colors.border,
        }
      ]}
      onPress={() => setSelectedTimeframe(timeframe.id)}
    >
      <Icon 
        name={timeframe.icon} 
        size={16} 
        color={selectedTimeframe === timeframe.id ? colors.primary : colors.textMuted} 
      />
      <Text style={[
        styles.timeframeText,
        {
          color: selectedTimeframe === timeframe.id ? colors.primary : colors.textMuted,
          fontWeight: selectedTimeframe === timeframe.id ? '600' : '500'
        }
      ]}>
        {timeframe.label}
      </Text>
    </TouchableOpacity>
  );

  const MetricButton = ({ metric }: { metric: any }) => (
    <TouchableOpacity
      style={[
        styles.metricButton,
        {
          backgroundColor: selectedMetric === metric.id ? metric.color + '20' : colors.border,
          borderColor: selectedMetric === metric.id ? metric.color : colors.border,
        }
      ]}
      onPress={() => setSelectedMetric(metric.id)}
    >
      <Icon 
        name={metric.icon} 
        size={18} 
        color={selectedMetric === metric.id ? metric.color : colors.textMuted} 
      />
      <Text style={[
        styles.metricText,
        {
          color: selectedMetric === metric.id ? metric.color : colors.textMuted,
          fontWeight: selectedMetric === metric.id ? '600' : '500'
        }
      ]}>
        {metric.label}
      </Text>
    </TouchableOpacity>
  );

  const KPICard = ({ kpi }: { kpi: any }) => (
    <TouchableOpacity 
      style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Alert.alert(kpi.title, `Current: ${kpi.value}\nChange: ${kpi.change}\n${kpi.subtitle}`)}
    >
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIcon, { backgroundColor: kpi.color + '20' }]}>
          <Icon name={kpi.icon} size={20} color={kpi.color} />
        </View>
        <View style={[styles.changeIndicator, {
          backgroundColor: kpi.trend === 'up' ? colors.success + '20' : colors.error + '20'
        }]}>
          <Icon 
            name={kpi.trend === 'up' ? 'trending-up' : 'trending-down'} 
            size={12} 
            color={kpi.trend === 'up' ? colors.success : colors.error} 
          />
          <Text style={[styles.changeText, {
            color: kpi.trend === 'up' ? colors.success : colors.error
          }]}>
            {kpi.change}
          </Text>
        </View>
      </View>
      <Text style={[styles.kpiValue, { color: colors.text }]}>{kpi.value}</Text>
      <Text style={[styles.kpiTitle, { color: colors.text }]}>{kpi.title}</Text>
      <Text style={[styles.kpiSubtitle, { color: colors.textMuted }]}>{kpi.subtitle}</Text>
    </TouchableOpacity>
  );

  const InsightCard = ({ insight }: { insight: any }) => (
    <TouchableOpacity 
      style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Alert.alert(insight.title, insight.subtitle)}
    >
      <View style={styles.insightHeader}>
        <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
          <Icon name={insight.icon} size={18} color={insight.color} />
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(insight.priority) }]}>
            {insight.priority.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={[styles.insightTitle, { color: colors.text }]}>{insight.title}</Text>
      <Text style={[styles.insightSubtitle, { color: colors.textMuted }]}>{insight.subtitle}</Text>
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: insight.color + '20' }]}>
        <Text style={[styles.actionText, { color: insight.color }]}>{insight.action}</Text>
        <Icon name="chevron-right" size={14} color={insight.color} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const PerformanceCard = ({ performance }: { performance: any }) => (
    <View style={[styles.performanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.performanceTitle, { color: colors.text }]}>{performance.category}</Text>
      <View style={styles.performanceGrid}>
        {Object.entries(performance.metrics).map(([key, metric]: [string, any]) => (
          <View key={key} style={styles.performanceMetric}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricKey, { color: colors.textMuted }]}>{key.toUpperCase()}</Text>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(metric.status) }]} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
            <Text style={[styles.metricChange, { 
              color: metric.change.startsWith('+') ? colors.success : 
                     metric.change.startsWith('-') ? colors.error : colors.textMuted
            }]}>
              {metric.change}
            </Text>
          </View>
        ))}
      </View>
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
          <Text style={[styles.title, { color: colors.text }]}>Analytics Dashboard</Text>
          <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="download" size={16} color={colors.primary} />
            <Text style={[styles.exportText, { color: colors.primary }]}>Export</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Comprehensive farm performance insights
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
        {/* Timeframe Selection */}
        <ProfessionalCard
          title="Time Period"
          subtitle="Select analysis timeframe"
          icon="calendar-clock"
          iconColor={colors.primary}
        >
          <View style={styles.timeframeContainer}>
            {timeframes.map((timeframe) => (
              <TimeframeButton key={timeframe.id} timeframe={timeframe} />
            ))}
          </View>
        </ProfessionalCard>

        {/* Key Performance Indicators */}
        <ProfessionalCard
          title="Key Performance Indicators"
          subtitle={`Performance overview for ${selectedTimeframe}`}
          icon="speedometer"
          iconColor={colors.success}
        >
          <View style={styles.kpiGrid}>
            {kpiData.map((kpi, index) => (
              <KPICard key={`kpi-${index}`} kpi={kpi} />
            ))}
          </View>
        </ProfessionalCard>

        {/* Analytics Insights */}
        <ProfessionalCard
          title="Smart Insights"
          subtitle="AI-powered recommendations"
          icon="brain"
          iconColor={colors.warning}
          headerRight={
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          }
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll}>
            {analyticsInsights.map((insight, index) => (
              <InsightCard key={`insight-${index}`} insight={insight} />
            ))}
          </ScrollView>
        </ProfessionalCard>

        {/* Metric Selection */}
        <ProfessionalCard
          title="Performance Metrics"
          subtitle="Choose metric to analyze"
          icon="chart-timeline-variant"
          iconColor={colors.info}
        >
          <View style={styles.metricsContainer}>
            {metrics.map((metric) => (
              <MetricButton key={metric.id} metric={metric} />
            ))}
          </View>
        </ProfessionalCard>

        {/* Field Performance */}
        <ProfessionalCard
          title="Field-wise Performance"
          subtitle="Detailed breakdown by field"
          icon="view-grid"
          iconColor={colors.primary}
          headerRight={
            <TouchableOpacity>
              <Text style={[styles.compareText, { color: colors.primary }]}>Compare</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.performanceContainer}>
            {performanceMetrics.map((performance, index) => (
              <PerformanceCard key={`performance-${index}`} performance={performance} />
            ))}
          </View>
        </ProfessionalCard>

        {/* Chart Visualization */}
        <ProfessionalCard
          title={`${metrics.find(m => m.id === selectedMetric)?.label} Trend`}
          subtitle={`${selectedTimeframe} performance visualization`}
          icon="chart-line"
          iconColor={colors.success}
          headerRight={
            <TouchableOpacity>
              <Icon name="fullscreen" size={20} color={colors.primary} />
            </TouchableOpacity>
          }
        >
          <View style={[styles.chartContainer, { backgroundColor: colors.border }]}>
            <View style={styles.chartPlaceholder}>
              <Icon name="chart-areaspline" size={48} color={colors.textMuted} />
              <Text style={[styles.chartText, { color: colors.textMuted }]}>
                Interactive chart visualization
              </Text>
              <Text style={[styles.chartSubtext, { color: colors.textMuted }]}>
                Showing {chartData[selectedTimeframe as keyof typeof chartData]?.length} data points
              </Text>
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  exportText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timeframeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  timeframeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  timeframeText: {
    fontSize: 12,
    marginLeft: 6,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  kpiCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  kpiSubtitle: {
    fontSize: 11,
  },
  insightsScroll: {
    marginTop: 12,
  },
  insightCard: {
    width: 260,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  insightSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  metricText: {
    fontSize: 13,
    marginLeft: 8,
  },
  performanceContainer: {
    marginTop: 12,
  },
  performanceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceMetric: {
    width: '48%',
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricKey: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricChange: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartContainer: {
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  chartPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  chartSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  compareText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default AnalyticsScreen;
