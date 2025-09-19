import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface ProfessionalCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: string;
  iconColor?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  onPress?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
  headerRight?: React.ReactNode;
  gradient?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  title,
  subtitle,
  value,
  icon,
  iconColor,
  change,
  changeType = 'neutral',
  onPress,
  style,
  children,
  headerRight,
  gradient = false,
  size = 'medium',
}) => {
  const { colors } = useTheme();

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return colors.success;
      case 'decrease': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase': return 'trending-up';
      case 'decrease': return 'trending-down';
      default: return 'minus';
    }
  };

  const cardStyles = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
      shadowColor: colors.shadow,
    },
    size === 'small' && styles.cardSmall,
    size === 'large' && styles.cardLarge,
    gradient && { 
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    style,
  ];

  const CardContent = () => (
    <View style={cardStyles}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: iconColor || colors.primary + '20' }]}>
              <Icon name={icon} size={24} color={iconColor || colors.primary} />
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: gradient ? '#FFFFFF' : colors.text }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: gradient ? '#FFFFFF80' : colors.textMuted }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {headerRight && (
          <View style={styles.headerRight}>
            {headerRight}
          </View>
        )}
      </View>

      {(value || change !== undefined) && (
        <View style={styles.metrics}>
          {value && (
            <Text style={[styles.value, { color: gradient ? '#FFFFFF' : colors.text }]}>
              {value}
            </Text>
          )}
          {change !== undefined && (
            <View style={styles.changeContainer}>
              <Icon 
                name={getChangeIcon()} 
                size={16} 
                color={getChangeColor()} 
              />
              <Text style={[styles.change, { color: getChangeColor() }]}>
                {Math.abs(change)}%
              </Text>
            </View>
          )}
        </View>
      )}

      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSmall: {
    padding: 12,
    borderRadius: 12,
  },
  cardLarge: {
    padding: 24,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    marginTop: 8,
  },
});

export default ProfessionalCard;
