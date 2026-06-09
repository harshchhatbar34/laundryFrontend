import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import api from '../../api/axiosInstance';
import ModernHeader from '../../components/ModernHeader';
import ThemedCard from '../../components/ThemedCard';
import { useTheme } from '../../theme/ThemeProvider';
import WatermarkView from '../../components/WatermarkView';

const PROMO_BANNERS = [
  {
    id: '1',
    title: '50% OFF',
    subtitle: 'On your first laundry order',
    code: 'FIRST50',
    color: ['#6366F1', '#4338CA'],
    icon: 'brightness-percent'
  },
  {
    id: '2',
    title: 'Free Delivery',
    subtitle: 'On orders above ₹299',
    code: 'FREEDEL',
    color: ['#0EA5E9', '#0284C7'],
    icon: 'truck-delivery'
  },
  {
    id: '3',
    title: 'Express Care',
    subtitle: 'Same day delivery available',
    code: 'EXPRESS',
    color: ['#F59E0B', '#D97706'],
    icon: 'flash'
  },
];

export default function HomeScreen({ navigation }) {
  const { user } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius, shadow } = theme;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      api.get('/services', { hideLoader: true }).then(({ data }) => {
        setServices(data.data.services || []);
      }).catch(() => { }).finally(() => setLoading(false));
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((i) => (i + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const banner = PROMO_BANNERS[bannerIndex];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <ModernHeader
        user={user}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        <View style={{ paddingHorizontal: spacing.lg }}>

          {/* Promo Banner */}
          <View style={{ marginTop: spacing.md, marginBottom: spacing.xl }}>
            <LinearGradient
              colors={banner.color}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.banner, { borderRadius: radius.xl, ...shadow.md }]}
            >
              <View style={styles.bannerContent}>
                <View style={[styles.bannerBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '800' }]}>LIMITED OFFER</Text>
                </View>
                <Text style={[typography.h1, { color: '#FFFFFF', marginTop: 8 }]}>{banner.title}</Text>
                <Text style={[typography.bodySmall, { color: 'rgba(255,255,255,0.8)', marginBottom: 12 }]}>{banner.subtitle}</Text>
                <View style={styles.promoCode}>
                  <Text style={[typography.caption, { color: '#FFFFFF' }]}>Use Code: </Text>
                  <Text style={[typography.label, { color: '#FFFFFF', fontWeight: '800' }]}>{banner.code}</Text>
                </View>
              </View>
              <View style={styles.bannerIconContainer}>
                <Icon name={banner.icon} size={80} color="rgba(255,255,255,0.15)" style={styles.bannerBgIcon} />
                <Icon name={banner.icon} size={48} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </View>

          {/* Section Header */}
          <View style={[styles.sectionHeader, { marginBottom: spacing.md }]}>
            <Text style={[typography.h3, { color: colors.text }]}>
              Our Services
            </Text>
          </View>

          {loading ? (
            <View style={{ height: 200, justifyContent: 'center' }}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : services.length === 0 ? (
            <ThemedCard variant="outline" style={{ alignItems: 'center', padding: spacing.xxl }}>
              <Icon name="Information-outline" size={48} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
                No services available at the moment
              </Text>
            </ThemedCard>
          ) : (
            <View style={styles.grid}>
              {services.map((svc) => (
                <TouchableOpacity
                  key={svc._id}
                  style={{ width: '48%', marginBottom: spacing.md }}
                  onPress={() => navigation.navigate('ServiceDetail', { service: svc })}
                  activeOpacity={0.9}
                >
                  <ThemedCard
                    shadowSize="sm"
                    style={{ alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.sm }}
                  >
                    <View style={[styles.serviceIconContainer, { backgroundColor: colors.primaryLight + '15' }]}>
                      <Text style={{ fontSize: 32 }}>{svc.icon || '👕'}</Text>
                    </View>
                    <Text style={[typography.body, { color: colors.text, textAlign: 'center', marginTop: spacing.md, fontWeight: '700' }]}>
                      {svc.name}
                    </Text>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </View>
          )}


        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 180,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 20,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  promoCode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  bannerBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsContainer: {
    overflow: 'hidden',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});
