// AdminProfileScreen — SuperAdmin Profile
// Premium dark-accented profile screen for the SuperAdmin role.

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
import { logout } from '../../store/slices/authSlice';
import { setTheme, ThemePreference } from '../../store/slices/themeSlice';
import { showToast } from '../../store/slices/uiSlice';
import { updateProfile } from '../../api/user';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FadeSlideIn from '../../animations/FadeSlideIn';

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#EF4444', '#8B5CF6', '#6366F1', '#F59E0B', '#10B981'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  navigation: any;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  iconColor: string;
  textColor: string;
  borderColor: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  iconColor,
  textColor,
  borderColor,
}) => (
  <View style={[sectionStyles.row, { borderBottomColor: borderColor }]}>
    <View style={[sectionStyles.iconWrap, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={[sectionStyles.title, { color: textColor }]}>{title}</Text>
  </View>
);

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 16,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ─── InfoRow ─────────────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
  labelColor: string;
  dividerColor: string;
  textColor: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  mono = false,
  valueColor,
  labelColor,
  dividerColor,
  textColor,
}) => (
  <View style={[infoRowStyles.row, { borderBottomColor: dividerColor }]}>
    <Text style={[infoRowStyles.label, { color: labelColor }]}>{label}</Text>
    <Text
      style={[
        infoRowStyles.value,
        { color: valueColor || textColor },
        mono ? infoRowStyles.mono : null,
      ]}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

// ─── QuickAction Row ──────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  mutedColor: string;
  dividerColor: string;
  onPress: () => void;
  last?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  iconBg,
  iconColor,
  textColor,
  mutedColor,
  dividerColor,
  onPress,
  last = false,
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[
      qaStyles.row,
      { borderBottomColor: dividerColor, borderBottomWidth: last ? 0 : 1 },
    ]}
  >
    <View style={[qaStyles.iconWrap, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={[qaStyles.label, { color: textColor }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={mutedColor} />
  </TouchableOpacity>
);

const qaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminProfileScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch<any>();

  const { user } = useSelector((s: RootState) => s.auth);
  const themePreference = useSelector((s: RootState) => s.theme.preference);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  // ── Derived data ────────────────────────────────────────────────────────────

  const name = user?.name || 'Super Admin';
  const email = user?.email || '';
  const userId = user?._id || '';
  const isActive = user?.isActive ?? true;

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarColor = AVATAR_COLORS[(initials.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  const memberYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear().toString()
    : '—';

  // hero gradient: prefer fire, fallback to ocean
  const heroBg: [string, string] =
    ((theme.gradients as any).fire as [string, string]) ??
    (theme.gradients.ocean as unknown as [string, string]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: editName.trim() });
      dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }));
      setEditing(false);
    } catch (_err) {
      dispatch(showToast({ message: 'Failed to update profile. Try again.', type: 'error' }));
    } finally {
      setSaving(false);
    }
  }, [editName, dispatch]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of the SuperAdmin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(logout() as any),
        },
      ],
      { cancelable: true }
    );
  }, [dispatch]);

  const c = theme.colors;

  return (
    <ScreenWrapper statusBarStyle="light-content" backgroundColor={c.background}>
      {/* ── Header ── */}
      <Header title="My Profile" subtitle="SuperAdmin Panel" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ═══════════════════════════════════════════════════════════
            1. HERO BANNER
        ════════════════════════════════════════════════════════════ */}
        <FadeSlideIn delay={0}>
          <LinearGradient
            colors={heroBg as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            {/* Decorative bubbles */}
            <View style={styles.heroDeco1} />
            <View style={styles.heroDeco2} />

            {/* Avatar */}
            <View style={styles.avatarRing}>
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>

            {/* Name + Email */}
            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroEmail}>{email}</Text>

            {/* Role badge */}
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#fff" />
              <Text style={styles.roleBadgeText}>Super Admin</Text>
            </View>

            {/* Stats strip */}
            <View style={styles.statsStrip}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Role</Text>
                <Text style={styles.statValue}>SuperAdmin</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={[styles.statValue, { color: isActive ? '#4ADE80' : '#F87171' }]}>
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Since</Text>
                <Text style={styles.statValue}>{memberYear}</Text>
              </View>
            </View>
          </LinearGradient>
        </FadeSlideIn>

        {/* ═══════════════════════════════════════════════════════════
            2. ACCOUNT DETAILS CARD
        ════════════════════════════════════════════════════════════ */}
        <FadeSlideIn delay={80}>
          <Card variant="elevated" padding="large" style={styles.card}>
            <SectionHeader
              icon="person-circle-outline"
              title="Account Details"
              iconColor={c.primary}
              textColor={c.textPrimary}
              borderColor={c.divider}
            />

            {editing ? (
              <View style={styles.editBlock}>
                <Input
                  label="Full Name"
                  value={editName}
                  onChangeText={setEditName}
                  icon="person-outline"
                  autoCapitalize="words"
                  style={styles.editInput}
                />
                <View style={styles.editButtons}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    size="small"
                    fullWidth={false}
                    onPress={() => {
                      setEditing(false);
                      setEditName(user?.name || '');
                    }}
                    style={styles.editBtnHalf}
                  />
                  <Button
                    title="Save Changes"
                    size="small"
                    fullWidth={false}
                    loading={saving}
                    onPress={handleSave}
                    style={styles.editBtnHalf}
                  />
                </View>
              </View>
            ) : (
              <>
                <InfoRow
                  label="Full Name"
                  value={name}
                  labelColor={c.textSecondary}
                  textColor={c.textPrimary}
                  dividerColor={c.divider}
                />
                <InfoRow
                  label="Email"
                  value={email}
                  labelColor={c.textSecondary}
                  textColor={c.textPrimary}
                  dividerColor={c.divider}
                />
                <InfoRow
                  label="Account Role"
                  value="Super Admin"
                  valueColor={c.primary}
                  labelColor={c.textSecondary}
                  textColor={c.textPrimary}
                  dividerColor={c.divider}
                />
                <InfoRow
                  label="Status"
                  value={isActive ? '✅ Active' : '❌ Inactive'}
                  valueColor={isActive ? c.success : c.error}
                  labelColor={c.textSecondary}
                  textColor={c.textPrimary}
                  dividerColor={c.divider}
                />
                <InfoRow
                  label="User ID"
                  value={`…${userId.slice(-8)}`}
                  mono
                  labelColor={c.textSecondary}
                  textColor={c.textPrimary}
                  dividerColor={c.divider}
                />
                <InfoRow
                  label="Member Since"
                  value={createdAt}
                  labelColor={c.textSecondary}
                  textColor={c.textPrimary}
                  dividerColor="transparent"
                />

                <TouchableOpacity
                  style={[
                    styles.inlineEditBtn,
                    { backgroundColor: c.primaryBg, borderColor: c.primary },
                  ]}
                  onPress={() => {
                    setEditName(name);
                    setEditing(true);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="create-outline" size={16} color={c.primary} />
                  <Text style={[styles.inlineEditBtnText, { color: c.primary }]}>
                    Edit Name
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        </FadeSlideIn>

        {/* ═══════════════════════════════════════════════════════════
            3. SECURITY INFO CARD
        ════════════════════════════════════════════════════════════ */}
        <FadeSlideIn delay={160}>
          <Card variant="elevated" padding="large" style={styles.card}>
            <SectionHeader
              icon="lock-closed-outline"
              title="Security Info"
              iconColor="#F59E0B"
              textColor={c.textPrimary}
              borderColor={c.divider}
            />

            <InfoRow
              label="Password"
              value="••••••••"
              labelColor={c.textSecondary}
              textColor={c.textPrimary}
              dividerColor={c.divider}
            />
            <InfoRow
              label="User ID"
              value={userId || '—'}
              mono
              labelColor={c.textSecondary}
              textColor={c.textPrimary}
              dividerColor={c.divider}
            />
            <InfoRow
              label="Account Created"
              value={createdAt}
              labelColor={c.textSecondary}
              textColor={c.textPrimary}
              dividerColor="transparent"
            />

            <View
              style={[
                styles.securityNote,
                {
                  backgroundColor: isDark ? '#451A03' : '#FEF3C7',
                  borderColor: '#F59E0B33',
                },
              ]}
            >
              <Ionicons name="information-circle-outline" size={16} color="#F59E0B" />
              <Text
                style={[
                  styles.securityNoteText,
                  { color: isDark ? '#FCD34D' : '#92400E' },
                ]}
              >
                Contact system admin to change password
              </Text>
            </View>
          </Card>
        </FadeSlideIn>

        {/* ═══════════════════════════════════════════════════════════
            4. PLATFORM QUICK ACTIONS CARD
        ════════════════════════════════════════════════════════════ */}
        <FadeSlideIn delay={220}>
          <Card variant="elevated" padding="large" style={styles.card}>
            <SectionHeader
              icon="grid-outline"
              title="Platform Quick Actions"
              iconColor="#8B5CF6"
              textColor={c.textPrimary}
              borderColor={c.divider}
            />

            <QuickAction
              icon="people-outline"
              label="Manage Owners"
              iconBg="#8B5CF620"
              iconColor="#8B5CF6"
              textColor={c.textPrimary}
              mutedColor={c.textMuted}
              dividerColor={c.divider}
              onPress={() =>
                navigation.navigate('Owners', { screen: 'OwnerManagement' })
              }
            />
            <QuickAction
              icon="bar-chart-outline"
              label="View Platform Stats"
              iconBg="#6366F120"
              iconColor="#6366F1"
              textColor={c.textPrimary}
              mutedColor={c.textMuted}
              dividerColor={c.divider}
              onPress={() =>
                navigation.navigate('Settings', { screen: 'PlatformStats' })
              }
            />
            <QuickAction
              icon="person-add-outline"
              label="Manage Customers"
              iconBg="#10B98120"
              iconColor="#10B981"
              textColor={c.textPrimary}
              mutedColor={c.textMuted}
              dividerColor="transparent"
              onPress={() =>
                navigation.navigate('Customers', { screen: 'CustomerManagement' })
              }
              last
            />
          </Card>
        </FadeSlideIn>

        {/* ═══════════════════════════════════════════════════════════
            5. APPEARANCE CARD
        ════════════════════════════════════════════════════════════ */}
        <FadeSlideIn delay={280}>
          <Card variant="elevated" padding="large" style={styles.card}>
            <SectionHeader
              icon="color-palette-outline"
              title="Appearance"
              iconColor={c.primary}
              textColor={c.textPrimary}
              borderColor={c.divider}
            />

            <View
              style={[
                styles.segmented,
                { backgroundColor: c.surfaceVariant, borderColor: c.border },
              ]}
            >
              {(['light', 'dark', 'system'] as ThemePreference[]).map((t, idx) => {
                const active = themePreference === t;
                const label =
                  t === 'light' ? '☀️  Light' : t === 'dark' ? '🌙  Dark' : '📱  System';
                return (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.8}
                    onPress={() => dispatch(setTheme(t) as any)}
                    style={[
                      styles.segmentBtn,
                      idx < 2
                        ? { borderRightWidth: 1, borderRightColor: c.border }
                        : null,
                      active ? { backgroundColor: c.primary } : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: active ? '#fff' : c.textSecondary },
                        active ? styles.segmentTextActive : null,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </FadeSlideIn>

        {/* ═══════════════════════════════════════════════════════════
            6. LOGOUT BUTTON
        ════════════════════════════════════════════════════════════ */}
        <FadeSlideIn delay={340}>
          <View style={styles.logoutWrap}>
            <Button
              title="Sign Out"
              variant="danger"
              icon="log-out-outline"
              iconPosition="left"
              onPress={handleLogout}
              size="large"
            />
          </View>
        </FadeSlideIn>
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 48,
  },

  // ── Hero ──────────────────────────────────────────────────────
  heroBanner: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 0,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroDeco1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -70,
    left: -60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroDeco2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 20,
    right: -50,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    gap: 5,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  statsStrip: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Cards ─────────────────────────────────────────────────────
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  // ── Edit block ────────────────────────────────────────────────
  editBlock: {
    marginTop: 4,
  },
  editInput: {
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtnHalf: {
    flex: 1,
  },

  // ── Inline edit button ────────────────────────────────────────
  inlineEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  inlineEditBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Security note ─────────────────────────────────────────────
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  securityNoteText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  // ── Appearance segmented control ──────────────────────────────
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
  segmentTextActive: {
    fontWeight: '700',
  },

  // ── Logout ────────────────────────────────────────────────────
  logoutWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
});
