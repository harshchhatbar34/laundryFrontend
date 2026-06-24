// FreshWash — Customer Profile Screen
// Rich profile with hero banner, editable info, addresses, appearance, and logout

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
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeContext';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { setTheme, ThemePreference } from '../../store/slices/themeSlice';
import { showToast } from '../../store/slices/uiSlice';
import { updateProfile, getAddresses } from '../../api/user';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FadeSlideIn from '../../animations/FadeSlideIn';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  navigation: any;
}

interface Address {
  _id: string;
  addressLine1?: string;
  line1?: string;
  city?: string;
  [key: string]: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(initials: string): string {
  const idx = (initials.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getYear(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).getFullYear().toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}

function InfoRow({ icon, iconColor, label, value }: InfoRowProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBg, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[theme.typography.bodySmall, styles.infoValue, { color: theme.colors.textPrimary }]}
        numberOfLines={2}
      >
        {value || '—'}
      </Text>
    </View>
  );
}

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  editActive?: boolean;
}

function SectionHeader({ icon, iconBg, title, subtitle, onEdit, editActive }: SectionHeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onEdit ? (
        <TouchableOpacity
          onPress={onEdit}
          style={[
            styles.editPill,
            {
              backgroundColor: editActive ? theme.colors.primary : theme.colors.primaryBg,
              borderColor: theme.colors.primary,
            },
          ]}
          activeOpacity={0.75}
        >
          <Ionicons
            name={editActive ? 'close-outline' : 'create-outline'}
            size={13}
            color={editActive ? '#fff' : theme.colors.primary}
          />
          <Text
            style={[
              styles.editPillText,
              { color: editActive ? '#fff' : theme.colors.primary },
            ]}
          >
            {editActive ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomerProfileScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const themePreference = useSelector((s: RootState) => s.theme.preference);

  // Personal info edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.mobileNumber || '');
  const [saving, setSaving] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(false);

  // Load addresses whenever screen focuses
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const fetchAddresses = async () => {
        setLoadingAddr(true);
        try {
          const data = await getAddresses();
          if (!cancelled) {
            // API might return { addresses: [...] } or an array
            const list = Array.isArray(data) ? data : data?.addresses || data?.data || [];
            setAddresses(list);
          }
        } catch {
          // silently ignore
        } finally {
          if (!cancelled) setLoadingAddr(false);
        }
      };
      fetchAddresses();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  // ── Derived values ──────────────────────────────────────────────────────────

  const name = user?.name || 'Guest';
  const email = user?.email || '';
  const phone = user?.mobileNumber || '';
  const isActive = user?.isActive ?? true;
  const createdAt = user?.createdAt;

  const initials = getInitials(name);
  const avatarColor = getAvatarColor(initials);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEditToggle = () => {
    if (!editing) {
      setEditName(user?.name || '');
      setEditPhone(user?.mobileNumber || '');
    }
    setEditing((v) => !v);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: editName, mobileNumber: editPhone });
      dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }) as any);
      setEditing(false);
    } catch (err: any) {
      dispatch(
        showToast({
          message: err?.response?.data?.message || 'Failed to update profile.',
          type: 'error',
        }) as any
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
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
  };

  const handleThemeChange = (pref: ThemePreference) => {
    dispatch(setTheme(pref) as any);
  };

  const themeOptions: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
    { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper edges={[]} statusBarStyle="light-content">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={theme.gradients.primary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
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
          <Ionicons name="person-circle-outline" size={13} color="rgba(255,255,255,0.9)" />
          <Text style={styles.roleBadgeText}>Customer</Text>
        </View>

        {/* Quick Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{addresses.length}</Text>
            <Text style={styles.statLabel}>Addresses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? '#34D399' : '#FB7185' }]} />
            <Text style={styles.statLabel}>{isActive ? 'Active' : 'Inactive'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getYear(createdAt)}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Scrollable Content ───────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Personal Information Card ──────────────────────────────────────── */}
        <FadeSlideIn delay={0} style={styles.fadeSlide}>
          <Card variant="elevated" padding="none" style={styles.card}>
            <View style={styles.cardInner}>
              <SectionHeader
                icon="person-outline"
                iconBg={theme.colors.primary}
                title="Personal Information"
                subtitle="Your account details"
                onEdit={handleEditToggle}
                editActive={editing}
              />

              <View style={styles.divider} />

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
                    onPress={handleSave}
                    loading={saving}
                    icon="checkmark-outline"
                    size="medium"
                  />
                </View>
              ) : (
                <View style={styles.infoList}>
                  <InfoRow
                    icon="person-outline"
                    iconColor={theme.colors.primary}
                    label="Name"
                    value={name}
                  />
                  <InfoRow
                    icon="mail-outline"
                    iconColor={theme.colors.info}
                    label="Email"
                    value={email}
                  />
                  <InfoRow
                    icon="call-outline"
                    iconColor={theme.colors.success}
                    label="Phone"
                    value={phone || 'Not provided'}
                  />
                  <InfoRow
                    icon="shield-checkmark-outline"
                    iconColor={isActive ? theme.colors.success : theme.colors.error}
                    label="Status"
                    value={isActive ? 'Active Account' : 'Inactive'}
                  />
                  <InfoRow
                    icon="calendar-outline"
                    iconColor={theme.colors.warning}
                    label="Member Since"
                    value={formatDate(createdAt)}
                  />
                </View>
              )}
            </View>
          </Card>
        </FadeSlideIn>

        {/* ── My Addresses Card ──────────────────────────────────────────────── */}
        <FadeSlideIn delay={80} style={styles.fadeSlide}>
          <Card variant="elevated" padding="none" style={styles.card}>
            <View style={styles.cardInner}>
              <SectionHeader
                icon="location-outline"
                iconBg="#10B981"
                title="My Addresses"
                subtitle={
                  addresses.length > 0
                    ? `${addresses.length} saved address${addresses.length > 1 ? 'es' : ''}`
                    : 'No addresses saved'
                }
              />

              <View style={styles.divider} />

              {loadingAddr ? (
                <View style={styles.emptyState}>
                  <Ionicons name="reload-outline" size={32} color={theme.colors.textMuted} />
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 8 }]}>
                    Loading addresses…
                  </Text>
                </View>
              ) : addresses.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconBg, { backgroundColor: theme.colors.primaryBg }]}>
                    <Ionicons name="location-outline" size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 12, textAlign: 'center' }]}>
                    No saved addresses yet.{'\n'}Add one for faster ordering!
                  </Text>
                  <Button
                    title="Add Address"
                    onPress={() => navigation.navigate('AddAddress')}
                    icon="add-outline"
                    size="small"
                    style={{ marginTop: 16 }}
                    fullWidth={false}
                  />
                </View>
              ) : (
                <>
                  {addresses.slice(0, 3).map((addr, idx) => (
                    <View
                      key={addr._id || idx}
                      style={[
                        styles.addressRow,
                        idx < Math.min(addresses.length, 3) - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.divider,
                        },
                      ]}
                    >
                      <View style={[styles.addrIconBg, { backgroundColor: '#10B98118' }]}>
                        <Ionicons name="location" size={16} color="#10B981" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={[theme.typography.bodySmall, { color: theme.colors.textPrimary, fontWeight: '600' }]}
                          numberOfLines={1}
                        >
                          {addr.addressLine1 || addr.line1 || addr.address || 'Address'}
                        </Text>
                        {addr.city ? (
                          <Text
                            style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}
                            numberOfLines={1}
                          >
                            {addr.city}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                    </View>
                  ))}

                  <View style={styles.addrActions}>
                    {addresses.length > 3 && (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('AddressList')}
                        style={[styles.addrBtn, { borderColor: theme.colors.border }]}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="list-outline" size={16} color={theme.colors.primary} />
                        <Text style={[styles.addrBtnText, { color: theme.colors.primary }]}>
                          View All ({addresses.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddAddress')}
                      style={[styles.addrBtn, { backgroundColor: theme.colors.primaryBg, borderColor: 'transparent' }]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
                      <Text style={[styles.addrBtnText, { color: theme.colors.primary }]}>Add Address</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Card>
        </FadeSlideIn>

        {/* ── Appearance Card ────────────────────────────────────────────────── */}
        <FadeSlideIn delay={160} style={styles.fadeSlide}>
          <Card variant="elevated" padding="none" style={styles.card}>
            <View style={styles.cardInner}>
              <SectionHeader
                icon="color-palette-outline"
                iconBg="#8B5CF6"
                title="Appearance"
                subtitle="Customize the app look"
              />

              <View style={styles.divider} />

              <View style={styles.themeRow}>
                {themeOptions.map((opt) => {
                  const isActive = themePreference === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => handleThemeChange(opt.value)}
                      activeOpacity={0.75}
                      style={[
                        styles.themeBtn,
                        {
                          backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceVariant,
                          borderColor: isActive ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={18}
                        color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.themeBtnText,
                          { color: isActive ? '#FFFFFF' : theme.colors.textSecondary },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Card>
        </FadeSlideIn>

        {/* ── Logout Button ──────────────────────────────────────────────────── */}
        <FadeSlideIn delay={240} style={styles.fadeSlide}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="danger"
            icon="log-out-outline"
            iconPosition="left"
            size="large"
            fullWidth
          />
        </FadeSlideIn>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <FadeSlideIn delay={300} style={[styles.fadeSlide, { marginBottom: 0 }]}>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            FreshWash · Customer Account
          </Text>
          {user?._id ? (
            <Text style={[styles.footerText, { color: theme.colors.textMuted, fontSize: 10 }]}>
              ID: {user._id}
            </Text>
          ) : null}
        </FadeSlideIn>
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Hero
  hero: {
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 5,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.5,
  },
  // Stats Strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Scroll
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  fadeSlide: {
    marginBottom: 0,
  },
  // Card
  card: {
    overflow: 'hidden',
  },
  cardInner: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.15)',
    marginVertical: 14,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderWidth: 1,
    gap: 4,
  },
  editPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Info Rows
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    width: 80,
    flexShrink: 0,
  },
  infoValue: {
    flex: 1,
    fontWeight: '600',
  },
  // Edit form
  editForm: {
    gap: 4,
  },
  // Addresses
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addrIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addrActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  addrBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    gap: 6,
  },
  addrBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Theme
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Footer
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
});
