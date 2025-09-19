import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ProfessionalCard from '../components/ProfessionalCard';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);

  const userProfile = {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@agrosense.com',
    phone: '+91 98765 43210',
    farmName: 'Kumar Organic Farms',
    location: 'Pune, Maharashtra',
    joinDate: 'January 2023',
    totalArea: '8.5 hectares',
    crops: ['Tomatoes', 'Onions', 'Carrots', 'Potatoes'],
    experience: '15 years',
    certification: 'Organic Certified',
  };

  const farmStats = [
    { 
      label: 'Total Harvest', 
      value: '245 tons', 
      icon: 'sprout', 
      color: '#4CAF50',
      change: '+18%',
      period: 'This year'
    },
    { 
      label: 'Revenue Generated', 
      value: '₹12.5L', 
      icon: 'currency-inr', 
      color: '#2196F3',
      change: '+25%',
      period: 'This year'
    },
    { 
      label: 'Water Saved', 
      value: '85,000L', 
      icon: 'water', 
      color: '#00BCD4',
      change: '+12%',
      period: 'This month'
    },
    { 
      label: 'Carbon Reduced', 
      value: '2.3 tons', 
      icon: 'leaf', 
      color: '#8BC34A',
      change: '+8%',
      period: 'This year'
    },
  ];

  const achievements = [
    {
      title: 'Sustainability Champion',
      description: 'Reduced water usage by 30%',
      icon: 'medal',
      color: '#FFD700',
      date: 'Nov 2024',
      points: 500
    },
    {
      title: 'Tech Innovator',
      description: 'First in region to adopt IoT',
      icon: 'trophy',
      color: '#FF6B35',
      date: 'Oct 2024',
      points: 750
    },
    {
      title: 'Quality Producer',
      description: 'Grade A certification 3 years',
      icon: 'star',
      color: '#9C27B0',
      date: 'Sep 2024',
      points: 600
    },
    {
      title: 'Community Leader',
      description: 'Mentored 25+ farmers',
      icon: 'account-group',
      color: '#3F51B5',
      date: 'Aug 2024',
      points: 400
    },
  ];

  const settingSections = [
    {
      title: 'Account Settings',
      icon: 'account-cog',
      items: [
        { id: 'edit_profile', label: 'Edit Profile', icon: 'account-edit', action: 'navigate' },
        { id: 'change_password', label: 'Change Password', icon: 'key', action: 'navigate' },
        { id: 'privacy', label: 'Privacy Settings', icon: 'shield-account', action: 'navigate' },
        { id: 'subscription', label: 'Subscription Plan', icon: 'crown', action: 'navigate', badge: 'Pro' },
      ]
    },
    {
      title: 'App Preferences',
      icon: 'cog',
      items: [
        { id: 'theme', label: 'Dark Mode', icon: 'theme-light-dark', action: 'toggle', value: isDark },
        { id: 'notifications', label: 'Notifications', icon: 'bell', action: 'toggle', value: notificationsEnabled },
        { id: 'auto_sync', label: 'Auto Sync', icon: 'sync', action: 'toggle', value: autoSync },
        { id: 'location', label: 'Location Tracking', icon: 'map-marker', action: 'toggle', value: locationTracking },
      ]
    },
    {
      title: 'Farm Management',
      icon: 'barn',
      items: [
        { id: 'farm_details', label: 'Farm Details', icon: 'home-variant', action: 'navigate' },
        { id: 'equipment', label: 'Equipment List', icon: 'tools', action: 'navigate' },
        { id: 'crops', label: 'Crop Calendar', icon: 'calendar', action: 'navigate' },
        { id: 'workers', label: 'Worker Management', icon: 'account-multiple', action: 'navigate' },
      ]
    },
    {
      title: 'Data & Analytics',
      icon: 'chart-line',
      items: [
        { id: 'export_data', label: 'Export Data', icon: 'download', action: 'navigate' },
        { id: 'reports', label: 'Generate Reports', icon: 'file-chart', action: 'navigate' },
        { id: 'backup', label: 'Data Backup', icon: 'backup-restore', action: 'navigate' },
        { id: 'analytics', label: 'Usage Analytics', icon: 'google-analytics', action: 'navigate' },
      ]
    },
    {
      title: 'Support & Help',
      icon: 'help-circle',
      items: [
        { id: 'help', label: 'Help Center', icon: 'help', action: 'navigate' },
        { id: 'contact', label: 'Contact Support', icon: 'phone', action: 'navigate' },
        { id: 'feedback', label: 'Send Feedback', icon: 'message-text', action: 'navigate' },
        { id: 'tutorial', label: 'App Tutorial', icon: 'school', action: 'navigate' },
      ]
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleSettingPress = (item: any) => {
    switch (item.action) {
      case 'toggle':
        if (item.id === 'theme') {
          toggleTheme();
        } else if (item.id === 'notifications') {
          setNotificationsEnabled(!notificationsEnabled);
        } else if (item.id === 'auto_sync') {
          setAutoSync(!autoSync);
        } else if (item.id === 'location') {
          setLocationTracking(!locationTracking);
        }
        break;
      case 'navigate':
        Alert.alert(item.label, `Opening ${item.label.toLowerCase()} screen...`);
        break;
    }
  };

  const getSettingValue = (item: any) => {
    switch (item.id) {
      case 'theme': return isDark;
      case 'notifications': return notificationsEnabled;
      case 'auto_sync': return autoSync;
      case 'location': return locationTracking;
      default: return false;
    }
  };

  const StatCard = ({ stat }: { stat: any }) => (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Alert.alert(stat.label, `${stat.value} ${stat.period}\nChange: ${stat.change}`)}
    >
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
          <Icon name={stat.icon} size={20} color={stat.color} />
        </View>
        <View style={[styles.changeIndicator, {
          backgroundColor: stat.change.startsWith('+') ? colors.success + '20' : colors.error + '20'
        }]}>
          <Text style={[styles.changeText, {
            color: stat.change.startsWith('+') ? colors.success : colors.error
          }]}>
            {stat.change}
          </Text>
        </View>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
      <Text style={[styles.statLabel, { color: colors.text }]}>{stat.label}</Text>
      <Text style={[styles.statPeriod, { color: colors.textMuted }]}>{stat.period}</Text>
    </TouchableOpacity>
  );

  const AchievementCard = ({ achievement }: { achievement: any }) => (
    <TouchableOpacity 
      style={[styles.achievementCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Alert.alert(achievement.title, achievement.description)}
    >
      <View style={styles.achievementHeader}>
        <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
          <Icon name={achievement.icon} size={24} color={achievement.color} />
        </View>
        <View style={styles.achievementPoints}>
          <Text style={[styles.pointsText, { color: achievement.color }]}>+{achievement.points}</Text>
        </View>
      </View>
      <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
      <Text style={[styles.achievementDesc, { color: colors.textMuted }]}>{achievement.description}</Text>
      <Text style={[styles.achievementDate, { color: colors.textMuted }]}>{achievement.date}</Text>
    </TouchableOpacity>
  );

  const SettingItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSettingPress(item)}
    >
      <View style={styles.settingLeft}>
        <Icon name={item.icon} size={20} color={colors.textMuted} />
        <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{item.badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.settingRight}>
        {item.action === 'toggle' ? (
          <Switch
            value={getSettingValue(item)}
            onValueChange={() => handleSettingPress(item)}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={getSettingValue(item) ? colors.primary : colors.textMuted}
          />
        ) : (
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        )}
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
        <TouchableOpacity style={styles.editButton}>
          <Icon name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
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
        {/* Profile Header */}
        <ProfessionalCard
          title="Profile"
          subtitle="Farm owner & sustainability champion"
          icon="account"
          iconColor={colors.primary}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>RK</Text>
              </View>
              <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{userProfile.name}</Text>
              <Text style={[styles.farmName, { color: colors.primary }]}>{userProfile.farmName}</Text>
              <View style={styles.profileDetails}>
                <View style={styles.detailRow}>
                  <Icon name="email" size={14} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>{userProfile.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="phone" size={14} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>{userProfile.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="map-marker" size={14} color={colors.textMuted} />
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>{userProfile.location}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: colors.text }]}>{userProfile.totalArea}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.textMuted }]}>Farm Area</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: colors.text }]}>{userProfile.experience}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.textMuted }]}>Experience</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: colors.text }]}>{userProfile.crops.length}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.textMuted }]}>Crop Types</Text>
            </View>
          </View>
        </ProfessionalCard>

        {/* Farm Performance */}
        <ProfessionalCard
          title="Farm Performance"
          subtitle="Key metrics and achievements"
          icon="chart-timeline-variant"
          iconColor={colors.success}
        >
          <View style={styles.statsGrid}>
            {farmStats.map((stat, index) => (
              <StatCard key={`stat-${index}`} stat={stat} />
            ))}
          </View>
        </ProfessionalCard>

        {/* Achievements */}
        <ProfessionalCard
          title="Achievements"
          subtitle="Milestones and recognition"
          icon="trophy"
          iconColor={colors.warning}
          headerRight={
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          }
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {achievements.map((achievement, index) => (
              <AchievementCard key={`achievement-${index}`} achievement={achievement} />
            ))}
          </ScrollView>
        </ProfessionalCard>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <ProfessionalCard
            key={`section-${sectionIndex}`}
            title={section.title}
            icon={section.icon}
            iconColor={colors.primary}
          >
            <View style={styles.settingsContainer}>
              {section.items.map((item, itemIndex) => (
                <SettingItem key={`${section.title}-${itemIndex}`} item={item} />
              ))}
            </View>
          </ProfessionalCard>
        ))}

        {/* Logout Section */}
        <ProfessionalCard
          title="Account Actions"
          icon="logout"
          iconColor={colors.error}
        >
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.error + '20' }]}
            onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: () => Alert.alert('Logged Out', 'You have been logged out successfully') }
            ])}
          >
            <Icon name="logout" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
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
    alignItems: 'flex-end',
  },
  editButton: {
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
  profileSection: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  profileDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    marginLeft: 8,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statPeriod: {
    fontSize: 11,
  },
  achievementsScroll: {
    marginTop: 12,
  },
  achievementCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementPoints: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  achievementDesc: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  achievementDate: {
    fontSize: 10,
  },
  settingsContainer: {
    marginTop: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  settingRight: {
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ProfileScreen;
