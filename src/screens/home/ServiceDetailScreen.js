import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import WatermarkView from '../../components/WatermarkView';
import { useTheme } from '../../theme/ThemeProvider';

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;
  const { theme } = useTheme();
  const { colors, spacing, typography, radius, shadow } = theme;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <StatusBar barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={theme.gradients.primary}
          style={[styles.hero, { paddingBottom: spacing.xxl + 20 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton}>
            </TouchableOpacity>
            <Text style={[typography.h3, { color: '#FFFFFF' }]}>Service Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.heroContent}>
            <View style={[styles.iconContainer, { ...shadow.lg }]}>
              <Text style={{ fontSize: 60 }}>{service.icon || '👕'}</Text>
            </View>
            <Text style={[typography.h1, { color: '#FFFFFF', marginTop: spacing.md }]}>{service.name}</Text>
            <Text style={[typography.body, { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xl }]}>
              {service.description || 'Professional care for your premium garments'}
            </Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: spacing.lg, marginTop: -spacing.xl }}>
          {/* Quick Info */}
          <View style={[styles.infoRow, { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.sm }]}>
            <View style={styles.infoItem}>
              <Icon name="clock-outline" size={24} color={colors.primary} />
              <Text style={[typography.label, { color: colors.text, marginTop: 4 }]}>{service.estimatedDays} Days</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Delivery</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.infoItem}>
              <Icon name="star-outline" size={24} color={colors.primary} />
              <Text style={[typography.label, { color: colors.text, marginTop: 4 }]}>Premium</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Quality</Text>
            </View>
          </View>

          {/* Features */}
          <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
            What's Included
          </Text>
          <ThemedCard shadowSize="sm" style={{ padding: spacing.lg }}>
            {[
              { t: 'Professional washing', d: 'Expert cleaning using premium detergents' },
              { t: 'Steam ironing', d: 'Perfectly pressed clothes with zero damage' },
              { t: 'Quality Checks', d: 'Multiple inspections for every item' },
              { t: 'Eco-Friendly', d: 'Safe for your skin and the environment' },
              { t: 'Express Handling', d: 'Handled with extra care and priority' }
            ].map((f, i) => (
              <View key={i} style={[styles.featureItem, i !== 4 && { marginBottom: spacing.md }]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.success + '15' }]}>
                  <Icon name="check-bold" size={16} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>{f.t}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{f.d}</Text>
                </View>
              </View>
            ))}
          </ThemedCard>

          <ThemedButton
            label="Book This Service"
            variant="primary"
            style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}
            onPress={() => navigation.navigate('CreateOrder', { service })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: StatusBar.currentHeight || 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoDivider: {
    width: 1,
    height: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
});
