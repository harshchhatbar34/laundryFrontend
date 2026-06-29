// FreshWash — Helper Profile Screen
// Full-featured profile for helpers: hero banner, contact editing, account info,
// appearance toggle (light/dark/system), and logout with confirmation.

import React, { useState, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import { RootState } from '../../store';
import { logout, updateUser } from '../../store/slices/authSlice';
import { setTheme, ThemePreference } from '../../store/slices/themeSlice';
import { showToast } from '../../store/slices/uiSlice';
import { updateProfile } from '../../api/user';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  navigation: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  editActive?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  onEdit,
  editActive,
}) => {
  const { theme } = useTheme();
  return (
    <View style={sharedStyles.sectionHeader}>
      <View style={[sharedStyles.sectionIconSquare, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 1 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onEdit ? (
        <TouchableOpacity
          onPress={onEdit}
          style={[
            sharedStyles.editPill,
            {
              backgroundColor: editActive
                ? theme.colors.primary + '20'
                : theme.colors.surfaceVariant,
              borderColor: editActive ? theme.colors.primary : theme.colors.border,
            },
          ]}
          hitSlop={theme.hitSlop}
        >
          <Ionicons
            name={editActive ? 'close-outline' : 'create-outline'}
            size={13}
            color={editActive ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              theme.typography.caption,
              {
                color: editActive ? theme.colors.primary : theme.colors.textSecondary,
                marginLeft: 3,
                fontWeight: '600',
              },
            ]}
          >
            {editActive ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, iconBg, label, value, valueColor }) => {
  const { theme } = useTheme();
  return (
    <View style={sharedStyles.infoRow}>
      <View style={[sharedStyles.infoIconBg, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={15} color="#FFFFFF" />
      </View>
      <Text
        style={[
          theme.typography.bodySmall,
          { color: theme.colors.textSecondary, width: 80 },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          theme.typography.body,
          {
            color: valueColor || theme.colors.textPrimary,
            flex: 1,
            fontWeight: '500',
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

export default function HelperProfileScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const themePreference = useSelector((s: RootState) => s.theme.preference);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.mobileNumber || '');
  const [saving, setSaving] = useState(false);

  // ── Derived values ──────────────────────────────────────────────────────────
  const name = user?.name || 'Helper';
  const email = user?.email || '';
  const phone = user?.mobileNumber || '—';
  const isActive = user?.isActive ?? false;
  const tenantId: string | undefined = user?.tenantId;
  const userId: string = user?._id || '';
  const createdAt: string = user?.createdAt || '';

  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarColor = AVATAR_PALETTE[(initials.charCodeAt(0) || 0) % AVATAR_PALETTE.length];

  const memberYear = createdAt ? new Date(createdAt).getFullYear().toString() : '—';
  const assignedDisplay = tenantId ? tenantId.slice(-6).toUpperCase() : 'Laundry';

  const gradientColors: [string, string, ...string[]] = (
    (theme.gradients as any).sunset ?? theme.gradients.ocean
  ) as [string, string, ...string[]];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleToggleEdit = useCallback(() => {
    if (editing) {
      setEditName(user?.name || '');
      setEditPhone(user?.mobileNumber || '');
    }
    setEditing((prev) => !prev);
  }, [editing, user]);

  const handleSaveProfile = useCallback(async () => {
    if (!editName.trim()) {
      dispatch(showToast({ message: 'Name cannot be empty', type: 'error' }));
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: editName.trim(), mobileNumber: editPhone.trim() });
      dispatch(updateUser({ name: editName.trim(), mobileNumber: editPhone.trim() }));
      dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }));
      setEditing(false);
    } catch (err: any) {
      dispatch(
        showToast({
          message: err?.response?.data?.message || 'Failed to update profile',
          type: 'error',
        })
      );
    } finally {
      setSaving(false);
    }
  }, [editName, editPhone, dispatch]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout() as any),
        },
      ],
      { cancelable: true }
    );
  }, [dispatch]);

  const handleSetTheme = useCallback(
    (pref: ThemePreference) => {
      dispatch(setTheme(pref) as any);
    },
    [dispatch]
  );

  // ── Theme option config ─────────────────────────────────────────────────────
  const themeOptions: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
    { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper statusBarStyle="light-content" backgroundColor={theme.colors.background}>
      {/* ── Header ── */}
      <Header
        title="My Profile"
        subtitle="Helper Account"
        showBack={navigation.canGoBack?.() ?? false}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <FadeSlideIn delay={0}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            {/* Decorative circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            {/* Avatar */}
            <View style={[styles.avatarRing, { borderColor: 'rgba(255,255,255,0.4)' }]}>
              <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>

            {/* Name + email */}
            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroEmail}>{email}</Text>

            {/* Role badge */}
            <View style={styles.roleBadge}>
              <Ionicons name="construct-outline" size={12} color="#92400E" />
              <Text style={styles.roleBadgeText}>HELPER</Text>
            </View>

            {/* Stats strip */}
            <View style={styles.statsStrip}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{assignedDisplay}</Text>
                <Text style={styles.statLabel}>Assigned To</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isActive ? '#10B981' : '#EF4444' },
                  ]}
                />
                <Text style={styles.statLabel}>{isActive ? 'Active' : 'Inactive'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{memberYear}</Text>
                <Text style={styles.statLabel}>Since</Text>
              </View>
            </View>
          </LinearGradient>
        </FadeSlideIn>

        {/* ── Contact Details Card ──────────────────────────────────────────── */}
        <FadeSlideIn delay={80}>
          <Card variant="elevated" padding="medium" style={styles.card}>
            <SectionHeader
              icon="person-outline"
              iconBg="#3B82F6"
              title="Contact Details"
              subtitle="Update your name and phone number"
              onEdit={handleToggleEdit}
              editActive={editing}
            />

            <View style={styles.cardDivider} />

            {editing ? (
              <View style={styles.editForm}>
                <Input
                  label="Full Name"
                  value={editName}
                  onChangeText={setEditName}
                  icon="person-outline"
                  autoCapitalize="words"
                />
                <Input
                  label="Phone Number"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  icon="call-outline"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  loading={saving}
                  icon="checkmark-outline"
                  size="medium"
                />
              </View>
            ) : (
              <View style={styles.infoList}>
                <InfoRow
                  icon="person-outline"
                  iconBg="#3B82F6"
                  label="Name"
                  value={name}
                />
                <InfoRow
                  icon="mail-outline"
                  iconBg="#8B5CF6"
                  label="Email"
                  value={email}
                />
                <InfoRow
                  icon="call-outline"
                  iconBg="#10B981"
                  label="Phone"
                  value={phone}
                />
              </View>
            )}
          </Card>
        </FadeSlideIn>

        {/* ── Account Info Card ─────────────────────────────────────────────── */}
        <FadeSlideIn delay={160}>
          <Card variant="elevated" padding="medium" style={styles.card}>
            <SectionHeader
              icon="shield-checkmark-outline"
              iconBg="#6366F1"
              title="Account Info"
              subtitle="Read-only account details"
            />

            <View style={styles.cardDivider} />

            <View style={styles.infoList}>
              <InfoRow
                icon="finger-print-outline"
                iconBg="#64748B"
                label="User ID"
                value={userId ? `…${userId.slice(-8)}` : '—'}
              />
              <InfoRow
                icon="construct-outline"
                iconBg="#F59E0B"
                label="Role"
                value="Helper"
                valueColor={theme.colors.warning}
              />
              <InfoRow
                icon="ellipse-outline"
                iconBg={isActive ? '#10B981' : '#EF4444'}
                label="Status"
                value={isActive ? 'Active' : 'Inactive'}
                valueColor={isActive ? theme.colors.success : theme.colors.error}
              />
              <InfoRow
                icon="business-outline"
                iconBg="#EC4899"
                label="Tenant ID"
                value={tenantId ? `…${tenantId.slice(-8)}` : '—'}
              />
              <InfoRow
                icon="calendar-outline"
                iconBg="#0EA5E9"
                label="Member Since"
                value={
                  createdAt
                    ? new Date(createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'
                }
              />
            </View>
          </Card>
        </FadeSlideIn>

        {/* ── Appearance Card ───────────────────────────────────────────────── */}
        <FadeSlideIn delay={220}>
          <Card variant="elevated" padding="medium" style={styles.card}>
            <SectionHeader
              icon="color-palette-outline"
              iconBg="#8B5CF6"
              title="Appearance"
              subtitle="Choose your preferred theme"
            />

            <View style={styles.cardDivider} />

            <View style={styles.themeRow}>
              {themeOptions.map(({ value, label, icon }) => {
                const isSelected = themePreference === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => handleSetTheme(value)}
                    activeOpacity={0.7}
                    style={[
                      styles.themeBtn,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary + '18'
                          : theme.colors.surfaceVariant,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={20}
                      color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        theme.typography.caption,
                        {
                          color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                          marginTop: 4,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {label}
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.themeCheckDot,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </FadeSlideIn>

        {/* ── Logout Button ─────────────────────────────────────────────────── */}
        <FadeSlideIn delay={280}>
          <View style={styles.logoutSection}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="danger"
              icon="log-out-outline"
              size="large"
              fullWidth
            />
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted, textAlign: 'center', marginTop: 8 },
              ]}
            >
              You will need to log in again after signing out.
            </Text>
          </View>
        </FadeSlideIn>
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles for sub-components (defined before main StyleSheet)
// ─────────────────────────────────────────────────────────────────────────────

const sharedStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionIconSquare: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Screen styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  // ── Hero Banner ─────────────────────────────────────────────────────────────
  heroBanner: {
    borderRadius: 20,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  decorCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -20,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
    gap: 5,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 1.5,
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },

  // ── Cards ───────────────────────────────────────────────────────────────────
  card: {
    marginBottom: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(100,116,139,0.12)',
    marginVertical: 12,
  },
  infoList: {
    gap: 2,
  },
  editForm: {
    gap: 4,
  },

  // ── Appearance ──────────────────────────────────────────────────────────────
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 2,
    position: 'relative',
  },
  themeCheckDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // ── Logout ──────────────────────────────────────────────────────────────────
  logoutSection: {
    marginTop: 4,
  },
});
