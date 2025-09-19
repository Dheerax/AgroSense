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
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ProfessionalCard from '../components/ProfessionalCard';

const { width } = Dimensions.get('window');

const MarketScreen = () => {
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('vegetables');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const categories = [
    { id: 'vegetables', name: 'Vegetables', icon: 'carrot', color: '#4CAF50' },
    { id: 'fruits', name: 'Fruits', icon: 'apple', color: '#FF9800' },
    { id: 'grains', name: 'Grains', icon: 'barley', color: '#8BC34A' },
    { id: 'dairy', name: 'Dairy', icon: 'cow', color: '#2196F3' },
    { id: 'spices', name: 'Spices', icon: 'chili-hot', color: '#F44336' },
  ];

  const marketInsights = [
    {
      title: 'Rising Demand',
      subtitle: 'Tomatoes up 15% this week',
      icon: 'trending-up',
      color: '#4CAF50',
      value: '+15%'
    },
    {
      title: 'Price Alert',
      subtitle: 'Onion prices dropping',
      icon: 'trending-down',
      color: '#FF5722',
      value: '-8%'
    },
    {
      title: 'Seasonal Peak',
      subtitle: 'Mango season begins',
      icon: 'weather-sunny',
      color: '#FF9800',
      value: 'Peak'
    },
    {
      title: 'Export Opportunity',
      subtitle: 'Rice export demand high',
      icon: 'export',
      color: '#2196F3',
      value: 'High'
    },
  ];

  const mockMarketData = {
    vegetables: [
      { 
        id: 1, 
        name: 'Tomato', 
        price: 45, 
        unit: 'kg', 
        change: 12.5, 
        trend: 'up', 
        quality: 'Premium',
        location: 'Mumbai APMC',
        lastUpdated: '2 min ago',
        volume: '2,500 tons',
        forecast: 'Rising',
        season: 'Peak'
      },
      { 
        id: 2, 
        name: 'Onion', 
        price: 32, 
        unit: 'kg', 
        change: -8.2, 
        trend: 'down', 
        quality: 'Grade A',
        location: 'Delhi Azadpur',
        lastUpdated: '5 min ago',
        volume: '1,800 tons',
        forecast: 'Stable',
        season: 'Off-season'
      },
      { 
        id: 3, 
        name: 'Potato', 
        price: 28, 
        unit: 'kg', 
        change: 3.7, 
        trend: 'up', 
        quality: 'Grade B',
        location: 'Kolkata',
        lastUpdated: '1 min ago',
        volume: '3,200 tons',
        forecast: 'Rising',
        season: 'Peak'
      },
      { 
        id: 4, 
        name: 'Carrot', 
        price: 38, 
        unit: 'kg', 
        change: 5.1, 
        trend: 'up', 
        quality: 'Premium',
        location: 'Bangalore',
        lastUpdated: '3 min ago',
        volume: '980 tons',
        forecast: 'Stable',
        season: 'In-season'
      },
    ],
    fruits: [
      { 
        id: 5, 
        name: 'Apple', 
        price: 120, 
        unit: 'kg', 
        change: -2.1, 
        trend: 'down', 
        quality: 'Premium',
        location: 'Kashmir',
        lastUpdated: '4 min ago',
        volume: '1,200 tons',
        forecast: 'Declining',
        season: 'End-season'
      },
      { 
        id: 6, 
        name: 'Banana', 
        price: 65, 
        unit: 'dozen', 
        change: 8.9, 
        trend: 'up', 
        quality: 'Grade A',
        location: 'Tamil Nadu',
        lastUpdated: '1 min ago',
        volume: '5,600 tons',
        forecast: 'Rising',
        season: 'Peak'
      },
    ],
    grains: [
      { 
        id: 7, 
        name: 'Wheat', 
        price: 2850, 
        unit: 'quintal', 
        change: 5.2, 
        trend: 'up', 
        quality: 'FAQ',
        location: 'Punjab',
        lastUpdated: '10 min ago',
        volume: '15,000 tons',
        forecast: 'Rising',
        season: 'Harvest'
      },
      { 
        id: 8, 
        name: 'Rice', 
        price: 3200, 
        unit: 'quintal', 
        change: -1.8, 
        trend: 'down', 
        quality: 'Basmati',
        location: 'Haryana',
        lastUpdated: '15 min ago',
        volume: '12,500 tons',
        forecast: 'Stable',
        season: 'Post-harvest'
      },
    ]
  };

  const marketData = mockMarketData;

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredData = marketData[selectedCategory as keyof typeof marketData]?.filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedData = [...filteredData].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price':
        return b.price - a.price;
      case 'change':
        return Math.abs(b.change) - Math.abs(a.change);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const CategoryButton = ({ category }: { category: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        { 
          backgroundColor: selectedCategory === category.id ? category.color + '20' : colors.border,
          borderColor: selectedCategory === category.id ? category.color : colors.border,
        }
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Icon 
        name={category.icon} 
        size={20} 
        color={selectedCategory === category.id ? category.color : colors.textMuted} 
      />
      <Text style={[
        styles.categoryText, 
        { 
          color: selectedCategory === category.id ? category.color : colors.textMuted,
          fontWeight: selectedCategory === category.id ? '600' : '500'
        }
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const MarketItemCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.marketCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Alert.alert(item.name, `Price: ₹${item.price}/${item.unit}\nLocation: ${item.location}\nQuality: ${item.quality}`)}
    >
      <View style={styles.marketCardHeader}>
        <View style={styles.marketCardTitle}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemLocation, { color: colors.textMuted }]}>{item.location}</Text>
        </View>
        <View style={styles.marketCardBadge}>
          <Text style={[styles.qualityBadge, { 
            backgroundColor: item.quality === 'Premium' ? colors.success + '20' : colors.warning + '20',
            color: item.quality === 'Premium' ? colors.success : colors.warning
          }]}>
            {item.quality}
          </Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: colors.text }]}>
          ₹{item.price}
          <Text style={[styles.unit, { color: colors.textMuted }]}>/{item.unit}</Text>
        </Text>
        <View style={[styles.changeContainer, {
          backgroundColor: item.trend === 'up' ? colors.success + '20' : colors.error + '20'
        }]}>
          <Icon 
            name={item.trend === 'up' ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={item.trend === 'up' ? colors.success : colors.error} 
          />
          <Text style={[styles.changeText, {
            color: item.trend === 'up' ? colors.success : colors.error
          }]}>
            {Math.abs(item.change)}%
          </Text>
        </View>
      </View>

      <View style={styles.marketCardFooter}>
        <View style={styles.footerItem}>
          <Icon name="clock-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>{item.lastUpdated}</Text>
        </View>
        <View style={styles.footerItem}>
          <Icon name="scale-balance" size={12} color={colors.textMuted} />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>{item.volume}</Text>
        </View>
        <View style={styles.footerItem}>
          <Icon name="chart-timeline-variant" size={12} color={colors.textMuted} />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>{item.forecast}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.statusBar} 
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Market Intelligence</Text>
          <View style={styles.headerControls}>
            <TouchableOpacity style={[styles.liveButton, { backgroundColor: isLiveMode ? colors.success + '20' : colors.border }]}>
              <View style={[styles.liveDot, { backgroundColor: isLiveMode ? colors.success : colors.textMuted }]} />
              <Text style={[styles.liveText, { color: isLiveMode ? colors.success : colors.textMuted }]}>
                {isLiveMode ? 'LIVE' : 'OFFLINE'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingsButton, { backgroundColor: colors.border }]}>
              <Icon name="cog" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.border }]}>
          <Icon name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search commodities..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
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
        {/* Market Insights */}
        <ProfessionalCard
          title="Market Insights"
          subtitle="Key trends and opportunities"
          icon="lightbulb"
          iconColor={colors.warning}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll}>
            {marketInsights.map((insight, index) => (
              <TouchableOpacity 
                key={`insight-${index}`}
                style={[styles.insightCard, { backgroundColor: colors.border }]}
                onPress={() => Alert.alert(insight.title, insight.subtitle)}
              >
                <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
                  <Icon name={insight.icon} size={20} color={insight.color} />
                </View>
                <Text style={[styles.insightTitle, { color: colors.text }]}>{insight.title}</Text>
                <Text style={[styles.insightSubtitle, { color: colors.textMuted }]}>{insight.subtitle}</Text>
                <Text style={[styles.insightValue, { color: insight.color }]}>{insight.value}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ProfessionalCard>

        {/* Categories */}
        <ProfessionalCard
          title="Categories"
          subtitle="Browse by commodity type"
          icon="grid"
          iconColor={colors.primary}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <CategoryButton key={category.id} category={category} />
            ))}
          </ScrollView>
        </ProfessionalCard>

        {/* Sort and Filter */}
        <View style={styles.controlsContainer}>
          <ProfessionalCard
            title="Sort & Filter"
            icon="sort"
            iconColor={colors.info}
            size="small"
            style={styles.sortCard}
          >
            <View style={styles.sortButtons}>
              {['name', 'price', 'change'].map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[styles.sortButton, {
                    backgroundColor: sortBy === sort ? colors.primary + '20' : colors.border,
                    borderColor: sortBy === sort ? colors.primary : colors.border,
                  }]}
                  onPress={() => setSortBy(sort)}
                >
                  <Text style={[styles.sortButtonText, {
                    color: sortBy === sort ? colors.primary : colors.textMuted
                  }]}>
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ProfessionalCard>

          <ProfessionalCard
            title="Live Updates"
            icon="refresh"
            iconColor={colors.success}
            size="small"
            style={styles.liveCard}
          >
            <View style={styles.liveToggle}>
              <Text style={[styles.liveToggleText, { color: colors.text }]}>Auto-refresh</Text>
              <Switch
                value={isLiveMode}
                onValueChange={setIsLiveMode}
                trackColor={{ false: colors.border, true: colors.success + '40' }}
                thumbColor={isLiveMode ? colors.success : colors.textMuted}
              />
            </View>
          </ProfessionalCard>
        </View>

        {/* Market Data */}
        <ProfessionalCard
          title={`${categories.find(c => c.id === selectedCategory)?.name} Prices`}
          subtitle={`${sortedData.length} items • Live market rates`}
          icon="chart-line"
          iconColor={colors.success}
          headerRight={
            <TouchableOpacity>
              <Text style={[styles.exportText, { color: colors.primary }]}>Export</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.marketGrid}>
            {sortedData.map((item) => (
              <MarketItemCard key={item.id} item={item} />
            ))}
          </View>
          
          {sortedData.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="package-variant-closed" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No items found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Try adjusting your search or category
              </Text>
            </View>
          )}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  insightsScroll: {
    marginTop: 12,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  insightSubtitle: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoriesScroll: {
    marginTop: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sortCard: {
    flex: 1,
    marginRight: 8,
  },
  liveCard: {
    flex: 1,
    marginLeft: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  liveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  liveToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exportText: {
    fontSize: 14,
    fontWeight: '600',
  },
  marketGrid: {
    marginTop: 12,
  },
  marketCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  marketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  marketCardTitle: {
    flex: 1,
  },
  marketCardBadge: {
    marginLeft: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 12,
  },
  qualityBadge: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
  },
  changeContainer: {
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
  marketCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerText: {
    fontSize: 10,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default MarketScreen;
