// FreshWash — Helper Profile Screen
// Unified Left-to-Right Electric Ocean Header + Helper Profile Hero

import React, { useState, useCallback } from 'react';
import {
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
import { showToast } from '../../store/slices/uiSlice';
import { updateProfile } from '../../api/user';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoutModal from '../../components/LogoutModal';

interface Props {
  navigation: any;
}

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

const AVATAR_PALETTE = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

export default function HelperProfileScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.mobileNumber || '');
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

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

  const canGoBack = navigation.canGoBack?.() ?? false;

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
    setShowLogoutModal(true);
  }, []);

  return (
    <ScreenWrapper edges={['top']} statusBarStyle="light-content">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Unified Hero Banner (My Profile Header + Helper Hero) ────── */}
        <LinearGradient
          colors={theme.gradients.ocean as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.unifiedHero}
        >
          {/* Top Title Bar */}
          <View style={styles.topHeaderRow}>
            {canGoBack ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarRing}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>

          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroEmail}>{email}</Text>

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

        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 14 }}>
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
        </View>
      </ScrollView>
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false);
          dispatch(logout() as any);
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </ScreenWrapper>
  );
}

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

const styles = StyleSheet.create({
  unifiedHero: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    width: '100%',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    gap: 5,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 1.5,
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
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
  logoutSection: {
    marginTop: 4,
  },
});
