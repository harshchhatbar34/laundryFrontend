// FreshWash — Owner Profile Screen
// Rich profile page: personal details + business info, all editable, no logout/theme

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { showToast } from '../../store/slices/uiSlice';
import { getOwnerProfile, updateOwnerProfile } from '../../api/owner';
import { updateProfile } from '../../api/user';
import { RootState } from '../../store';

interface Props {
  navigation: any;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function OwnerProfileScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  // ── Personal info ──────────────────────────────────────────────────
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [loadingPersonal, setLoadingPersonal] = useState(false);

  // ── Business info ──────────────────────────────────────────────────
  const [laundryName, setLaundryName] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [draftLaundry, setDraftLaundry] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftState, setDraftState] = useState('');
  const [loadingBusiness, setLoadingBusiness] = useState(false);

  // ── Fetch business profile ─────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const res = await getOwnerProfile();
      const p = res?.data;
      if (p) {
        setLaundryName(p.laundryName || '');
        setCity(p.city || '');
        setStateName(p.state || '');
        setUpiId(p.upiId || '');
      }
    } catch (e) {
      console.log('fetchProfile error:', e);
    }
  };

  useFocusEffect(useCallback(() => { fetchProfile(); }, []));

  // ── Save personal info ─────────────────────────────────────────────
  const handleSavePersonal = async () => {
    if (!draftName.trim()) {
      dispatch(showToast({ type: 'warning', message: 'Name cannot be empty' }));
      return;
    }
    setLoadingPersonal(true);
    try {
      await updateProfile({ name: draftName.trim(), mobileNumber: draftPhone.trim() });
      setEditingPersonal(false);
      dispatch(showToast({ type: 'success', message: 'Personal info updated!' }));
    } catch (_) {
      // error toast shown by interceptor
    } finally {
      setLoadingPersonal(false);
    }
  };

  // ── Save business info ─────────────────────────────────────────────
  const handleSaveBusiness = async () => {
    if (!draftLaundry.trim()) {
      dispatch(showToast({ type: 'warning', message: 'Laundry name cannot be empty' }));
      return;
    }
    setLoadingBusiness(true);
    try {
      const res = await updateOwnerProfile({
        laundryName: draftLaundry.trim(),
        city: draftCity.trim(),
        state: draftState.trim(),
      });
      const p = res?.data;
      setLaundryName(p?.laundryName || draftLaundry.trim());
      setCity(p?.city || draftCity.trim());
      setStateName(p?.state || draftState.trim());
      setEditingBusiness(false);
      dispatch(showToast({ type: 'success', message: 'Business info updated!' }));
    } catch (_) { }
    finally { setLoadingBusiness(false); }
  };

  const displayName = user?.name || 'Owner';
  const initials = getInitials(displayName);

  // Avatar gradient picks based on initials for a consistent unique color
  const avatarColor = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'][
    (initials.charCodeAt(0) || 0) % 5
  ];

  return (
    <ScreenWrapper edges={[]}>
      <Header title="My Profile" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* ── Hero Banner ────────────────────────────────────────── */}
        <LinearGradient colors={theme.gradients.ocean as any} style={styles.hero}>
          {/* Avatar circle */}
          <View style={[styles.avatarCircle, { backgroundColor: avatarColor + 'CC' }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={[theme.typography.h2, { color: '#FFF', marginTop: 14, textAlign: 'center' }]}>
            {displayName}
          </Text>

          <Text style={[theme.typography.bodySmall, { color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center' }]}>
            {user?.email || '—'}
          </Text>

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#FFF" />
            <Text style={styles.roleBadgeText}>Owner</Text>
          </View>

          {/* Quick stats row */}
          <View style={styles.statsRow}>
            <StatPill icon="storefront-outline" label="Laundry" value={laundryName || '—'} />
            <View style={styles.statsDivider} />
            <StatPill icon="location-outline" label="City" value={city || '—'} />
            <View style={styles.statsDivider} />
            <StatPill icon="qr-code-outline" label="UPI" value={upiId ? 'Set ✓' : 'Not set'} valueColor={upiId ? '#6EE7B7' : 'rgba(255,255,255,0.55)'} />
          </View>
        </LinearGradient>

        <View style={{ padding: 16 }}>

          {/* ── Personal Information ──────────────────────────────── */}
          <FadeSlideIn delay={0}>
            <Card padding="medium" style={{ marginBottom: 16 }}>
              <SectionHeader
                icon="person-outline"
                iconColor="#6366F1"
                title="Personal Information"
                subtitle="Your account details"
                editing={editingPersonal}
                onEdit={() => {
                  setDraftName(user?.name || '');
                  setDraftPhone(user?.mobileNumber || '');
                  setEditingPersonal(true);
                }}
                theme={theme}
              />

              {editingPersonal ? (
                <View style={{ marginTop: 16 }}>
                  <Input
                    label="Full Name"
                    value={draftName}
                    onChangeText={setDraftName}
                    icon="person-outline"
                    placeholder="Your full name"
                  />
                  <Input
                    label="Phone Number"
                    value={draftPhone}
                    onChangeText={setDraftPhone}
                    icon="call-outline"
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                  />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <Button title="Save" onPress={handleSavePersonal} loading={loadingPersonal} icon="checkmark-circle-outline" style={{ flex: 1 }} />
                    <Button title="Cancel" onPress={() => setEditingPersonal(false)} variant="outline" style={{ flex: 1 }} />
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 14, gap: 2 }}>
                  <InfoRow icon="person-outline" label="Name" value={user?.name || '—'} theme={theme} />
                  <InfoRow icon="mail-outline" label="Email" value={user?.email || '—'} theme={theme} />
                  <InfoRow icon="call-outline" label="Phone" value={user?.mobileNumber || 'Not added'} theme={theme} />
                  <InfoRow icon="shield-outline" label="Role" value="Owner" valueColor={theme.colors.primary} theme={theme} />
                  <InfoRow
                    icon="calendar-outline"
                    label="Member Since"
                    value={formatDate(user?.createdAt)}
                    theme={theme}
                  />
                </View>
              )}
            </Card>
          </FadeSlideIn>

          {/* ── Business Information ──────────────────────────────── */}
          <FadeSlideIn delay={80}>
            <Card padding="medium" style={{ marginBottom: 16 }}>
              <SectionHeader
                icon="storefront-outline"
                iconColor="#10B981"
                title="Business Information"
                subtitle="Your laundry business details"
                editing={editingBusiness}
                onEdit={() => {
                  setDraftLaundry(laundryName);
                  setDraftCity(city);
                  setDraftState(stateName);
                  setEditingBusiness(true);
                }}
                theme={theme}
              />

              {editingBusiness ? (
                <View style={{ marginTop: 16 }}>
                  <Input
                    label="Laundry Name"
                    value={draftLaundry}
                    onChangeText={setDraftLaundry}
                    icon="storefront-outline"
                    placeholder="e.g. Harsh Laundry"
                  />
                  <Input
                    label="City"
                    value={draftCity}
                    onChangeText={setDraftCity}
                    icon="location-outline"
                    placeholder="e.g. Ahmedabad"
                  />
                  <Input
                    label="State"
                    value={draftState}
                    onChangeText={setDraftState}
                    icon="map-outline"
                    placeholder="e.g. Gujarat"
                  />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <Button title="Save" onPress={handleSaveBusiness} loading={loadingBusiness} icon="checkmark-circle-outline" style={{ flex: 1 }} />
                    <Button title="Cancel" onPress={() => setEditingBusiness(false)} variant="outline" style={{ flex: 1 }} />
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 14, gap: 2 }}>
                  <InfoRow icon="storefront-outline" label="Laundry" value={laundryName || '—'} theme={theme} />
                  <InfoRow icon="location-outline" label="City" value={city || '—'} theme={theme} />
                  <InfoRow icon="map-outline" label="State" value={stateName || '—'} theme={theme} />
                  <InfoRow
                    icon="qr-code-outline"
                    label="UPI ID"
                    value={upiId || 'Not set'}
                    valueColor={upiId ? '#10B981' : theme.colors.textMuted}
                    theme={theme}
                  />
                </View>
              )}
            </Card>
          </FadeSlideIn>

          {/* ── Account Security ──────────────────────────────────── */}
          <FadeSlideIn delay={160}>
            <Card padding="medium" style={{ marginBottom: 16 }}>
              <SectionHeader
                icon="lock-closed-outline"
                iconColor="#F59E0B"
                title="Account"
                subtitle="Account ID and status"
                editing={false}
                theme={theme}
              />
              <View style={{ marginTop: 14, gap: 2 }}>
                <InfoRow icon="finger-print-outline" label="User ID" value={user?._id ? `…${user._id.slice(-8)}` : '—'} theme={theme} />
                <InfoRow
                  icon="checkmark-circle-outline"
                  label="Status"
                  value={user?.isActive !== false ? 'Active' : 'Inactive'}
                  valueColor={user?.isActive !== false ? '#10B981' : theme.colors.error}
                  theme={theme}
                />
                <InfoRow icon="server-outline" label="Tenant" value={user?.tenantId ? `…${user.tenantId.slice(-8)}` : '—'} theme={theme} />
              </View>
            </Card>
          </FadeSlideIn>

          {/* ── Quick Actions ─────────────────────────────────────── */}
          <FadeSlideIn delay={220}>
            <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 10 }]}>
              Quick Actions
            </Text>

            <QuickAction
              icon="qr-code-outline"
              label="Manage UPI Payment"
              subtitle="Add or edit your UPI ID"
              color="#10B981"
              theme={theme}
              onPress={() => navigation.navigate('Settings', { screen: 'OwnerSettingsMain' })}
            />
            <QuickAction
              icon="people-outline"
              label="Manage Helpers"
              subtitle="Add or remove delivery helpers"
              color="#F59E0B"
              theme={theme}
              onPress={() => navigation.navigate('Settings', { screen: 'HelperManagement' })}
            />
            <QuickAction
              icon="storefront-outline"
              label="Manage Branches"
              subtitle="View and configure branches"
              color="#6366F1"
              theme={theme}
              onPress={() => navigation.navigate('Branches', { screen: 'BranchList' })}
            />
          </FadeSlideIn>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function SectionHeader({
  icon, iconColor, title, subtitle, editing, onEdit, theme,
}: {
  icon: any; iconColor: string; title: string; subtitle: string;
  editing: boolean; onEdit?: () => void; theme: any;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={[styles.sectionIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>{title}</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text>
      </View>
      {!editing && onEdit && (
        <TouchableOpacity
          onPress={onEdit}
          style={[styles.editPill, { backgroundColor: theme.colors.primary + '18' }]}
        >
          <Ionicons name="create-outline" size={15} color={theme.colors.primary} />
          <Text style={[theme.typography.labelSmall, { color: theme.colors.primary, marginLeft: 4 }]}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function InfoRow({
  icon, label, value, valueColor, theme,
}: {
  icon: any; label: string; value: string; valueColor?: string; theme: any;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Ionicons name={icon} size={14} color={theme.colors.textSecondary} />
      </View>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, width: 80, marginLeft: 10 }]}>
        {label}
      </Text>
      <Text
        style={[theme.typography.body, { color: valueColor || theme.colors.textPrimary, flex: 1 }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function StatPill({
  icon, label, value, valueColor,
}: {
  icon: any; label: string; value: string; valueColor?: string;
}) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={14} color="rgba(255,255,255,0.7)" />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function QuickAction({
  icon, label, subtitle, color, theme, onPress,
}: {
  icon: any; label: string; subtitle: string; color: string; theme: any; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.quickAction, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}
    >
      <View style={[styles.qaIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{label}</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  roleBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 20,
    width: '100%',
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  qaIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
