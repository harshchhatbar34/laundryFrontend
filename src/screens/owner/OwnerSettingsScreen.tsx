// FreshWash — Owner Settings Screen
// Unified Left-to-Right Electric Ocean Header + Shop Profile Hero

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useDispatch } from 'react-redux';
import UpiQrCode from '../../components/ui/UpiQrCode';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FadeSlideIn from '../../animations/FadeSlideIn';
import LogoutModal from '../../components/LogoutModal';
import { useTheme } from '../../theme/ThemeContext';
import { showToast } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { getOwnerProfile, updateOwnerProfile } from '../../api/owner';

interface Props {
  navigation: any;
}

export default function OwnerSettingsScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();

  // Display state
  const [laundryName, setLaundryName] = useState('');
  const laundryNameRef = useRef(laundryName);
  laundryNameRef.current = laundryName;
  const [upiId, setUpiId] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  // Edit UI
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingUpi, setEditingUpi] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  // Draft inputs
  const [draftLaundryName, setDraftLaundryName] = useState('');
  const [draftUpiId, setDraftUpiId] = useState('');

  const fetchProfile = useCallback(async (silent = false) => {
    try {
      const res = await getOwnerProfile(silent ? { hideLoader: true } : undefined);
      const profile = res?.data;
      if (profile) {
        setLaundryName(profile.laundryName || '');
        setUpiId(profile.upiId || '');
        setCity(profile.city || '');
        setStateName(profile.state || '');
      }
    } catch (e) {
      console.log('fetchProfile error:', e);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    const isFirstLoad = !laundryNameRef.current;
    fetchProfile(!isFirstLoad);
  }, [fetchProfile]));

  const saveUpi = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !trimmed.includes('@')) {
      dispatch(showToast({ type: 'warning', message: 'Enter a valid UPI ID (e.g. name@upi)' }));
      return;
    }
    setLoading(true);
    try {
      const res = await updateOwnerProfile({ upiId: trimmed });
      const profile = res?.data;
      if (profile) {
        setUpiId(profile.upiId || '');
        if (profile.laundryName) setLaundryName(profile.laundryName);
      } else {
        setUpiId(trimmed);
      }
      setEditingUpi(false);
      dispatch(showToast({ type: 'success', message: trimmed ? 'UPI ID saved!' : 'UPI ID removed' }));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUpi = () => saveUpi(draftUpiId);

  const handleRemoveUpi = () => {
    Alert.alert('Remove UPI ID', 'Remove your UPI ID?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => saveUpi('') },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!draftLaundryName.trim()) {
      dispatch(showToast({ type: 'warning', message: 'Laundry name cannot be empty' }));
      return;
    }
    setLoading(true);
    try {
      const res = await updateOwnerProfile({ laundryName: draftLaundryName.trim() });
      const profile = res?.data;
      setLaundryName(profile?.laundryName || draftLaundryName.trim());
      setEditingProfile(false);
      dispatch(showToast({ type: 'success', message: 'Profile updated!' }));
    } catch (_) { }
    finally { setLoading(false); }
  };

  const handleCopyUpi = async () => {
    if (!upiId) return;
    await Clipboard.setStringAsync(upiId);
    dispatch(showToast({ type: 'success', message: `Copied: ${upiId}` }));
  };

  const handleTestPay = () => {
    if (!upiId) return;
    const url = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(laundryName)}&cu=INR`;
    Linking.openURL(url).catch(() => {
      dispatch(showToast({ type: 'error', message: 'No UPI app found on device' }));
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const qrBgColor = isDark ? '#1E2A3A' : '#FFFFFF';
  const qrFgColor = isDark ? '#E2F0FF' : '#111111';

  const upiQrValue = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(laundryName)}&cu=INR`
    : 'https://freshwash.app';

  const managementLinks = [
    { icon: 'people-outline' as const,        label: 'Manage Helpers',   color: '#F59E0B', screen: 'HelperManagement', tab: 'Settings' },
    { icon: 'storefront-outline' as const,    label: 'Manage Branches',  color: theme.colors.primary, screen: 'BranchList', tab: 'Settings' },
    { icon: 'people-circle-outline' as const, label: 'Manage Customers', color: '#E11D48', screen: 'CustomerManagement', tab: 'Settings' },
    { icon: 'bar-chart-outline' as const,     label: 'View Stats',       color: '#8B5CF6', screen: 'OwnerStats', tab: 'Settings' },
    { icon: 'person-outline' as const,        label: 'My Profile',       color: '#10B981', screen: 'ProfileMain', tab: 'Settings' },
  ];

  const canGoBack = navigation.canGoBack();

  return (
    <ScreenWrapper edges={['top']} statusBarStyle="light-content">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* ── Unified Hero (Merged Settings Header + Laundry Profile) ────────── */}
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
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Shop Info Container */}
          <View style={styles.heroRow}>
            <View style={styles.heroAvatar}>
              <Ionicons name="business" size={32} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.shopNameText} numberOfLines={1}>
                {laundryName || 'My Laundry'}
              </Text>
              {city ? (
                <Text style={styles.locationText}>
                  📍 {city}{stateName ? `, ${stateName}` : ''}
                </Text>
              ) : null}
              <View style={[styles.upiChip, { backgroundColor: upiId ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)' }]}>
                <Ionicons
                  name={upiId ? 'qr-code-outline' : 'alert-circle-outline'}
                  size={11}
                  color={upiId ? '#6EE7B7' : 'rgba(255,255,255,0.7)'}
                />
                <Text style={[styles.upiChipText, { color: upiId ? '#D1FAE5' : 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
                  {upiId || 'UPI not set — add below'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 16 }}>

          {/* ── UPI Section ──────────────────────────────────────────── */}
          <FadeSlideIn delay={0}>
            <Card padding="medium" style={{ marginBottom: 16 }}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#10B98118' }]}>
                  <Ionicons name="qr-code-outline" size={20} color="#10B981" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>UPI Payment ID</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                    Customers pay to this UPI ID
                  </Text>
                </View>
                {!editingUpi && (
                  <TouchableOpacity
                    onPress={() => { setDraftUpiId(upiId); setEditingUpi(true); }}
                    style={[styles.editPill, { backgroundColor: theme.colors.primary + '18' }]}
                  >
                    <Ionicons name="create-outline" size={15} color={theme.colors.primary} />
                    <Text style={[theme.typography.labelSmall, { color: theme.colors.primary, marginLeft: 4 }]}>
                      {upiId ? 'Edit' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {editingUpi ? (
                <View style={{ marginTop: 16 }}>
                  <Input
                    label="UPI ID"
                    value={draftUpiId}
                    onChangeText={setDraftUpiId}
                    icon="qr-code-outline"
                    placeholder="name@upi"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: -8, marginBottom: 14, paddingHorizontal: 4 }]}>
                    e.g. 9876543210@paytm · name@okaxis · shop@ybl
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button title="Save UPI" onPress={handleSaveUpi} loading={loading} icon="checkmark-circle-outline" style={{ flex: 1 }} />
                    <Button title="Cancel" onPress={() => setEditingUpi(false)} variant="outline" style={{ flex: 1 }} />
                  </View>
                </View>
              ) : upiId ? (
                <View style={{ marginTop: 14 }}>
                  <View style={[styles.upiDisplay, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.borderLight }]}>
                    <Ionicons name="at-circle-outline" size={22} color="#10B981" />
                    <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1, marginLeft: 10 }]} selectable>
                      {upiId}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setQrModalVisible(true)}
                    style={[styles.qrPreviewRow, {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.borderLight,
                    }]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.qrPreviewThumb, { backgroundColor: qrBgColor, padding: 6, borderRadius: 8 }]}>
                      <UpiQrCode value={upiQrValue} size={72} backgroundColor={qrBgColor} color={qrFgColor} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>UPI QR Code</Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 3 }]}>
                        Show to customer for instant scan & pay
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <Ionicons name="expand-outline" size={13} color={theme.colors.primary} />
                        <Text style={[theme.typography.caption, { color: theme.colors.primary, marginLeft: 4 }]}>Tap to enlarge</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <TouchableOpacity style={[styles.chip, { backgroundColor: theme.colors.surfaceVariant, flex: 1 }]} onPress={handleCopyUpi}>
                      <Ionicons name="copy-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 5 }]}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.chip, { backgroundColor: '#10B98112', flex: 1 }]} onPress={handleTestPay}>
                      <Ionicons name="open-outline" size={14} color="#10B981" />
                      <Text style={[theme.typography.caption, { color: '#10B981', marginLeft: 5 }]}>Test Pay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.chip, { backgroundColor: theme.colors.errorBg, flex: 1 }]} onPress={handleRemoveUpi}>
                      <Ionicons name="trash-outline" size={14} color={theme.colors.error} />
                      <Text style={[theme.typography.caption, { color: theme.colors.error, marginLeft: 5 }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.emptyBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Ionicons name="qr-code-outline" size={40} color={theme.colors.textMuted} />
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 10, textAlign: 'center' }]}>
                    No UPI ID added yet.{'\n'}Add one so customers can pay at delivery.
                  </Text>
                  <TouchableOpacity
                    onPress={() => { setDraftUpiId(''); setEditingUpi(true); }}
                    style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                    <Text style={[theme.typography.label, { color: '#FFF', marginLeft: 6 }]}>Add UPI ID</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          </FadeSlideIn>

          {/* ── Laundry Profile ──────────────────────────────────────── */}
          <FadeSlideIn delay={80}>
            <Card padding="medium" style={{ marginBottom: 16 }}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>Laundry Profile</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>Business name</Text>
                </View>
                {!editingProfile && (
                  <TouchableOpacity
                    onPress={() => { setDraftLaundryName(laundryName); setEditingProfile(true); }}
                    style={[styles.editPill, { backgroundColor: theme.colors.primary + '15' }]}
                  >
                    <Ionicons name="create-outline" size={15} color={theme.colors.primary} />
                    <Text style={[theme.typography.labelSmall, { color: theme.colors.primary, marginLeft: 4 }]}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              {editingProfile ? (
                <View style={{ marginTop: 16 }}>
                  <Input label="Laundry Name" value={draftLaundryName} onChangeText={setDraftLaundryName} icon="business-outline" />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button title="Save" onPress={handleSaveProfile} loading={loading} icon="checkmark-circle-outline" style={{ flex: 1 }} />
                    <Button title="Cancel" onPress={() => setEditingProfile(false)} variant="outline" style={{ flex: 1 }} />
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 12 }}>
                  <InfoRow icon="storefront-outline" label="Name" value={laundryName || '—'} theme={theme} />
                  {city ? <InfoRow icon="location-outline" label="City" value={`${city}${stateName ? `, ${stateName}` : ''}`} theme={theme} /> : null}
                </View>
              )}
            </Card>
          </FadeSlideIn>

          {/* ── Management Links ─────────────────────────────────────── */}
          <FadeSlideIn delay={160}>
            <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 10 }]}>Management</Text>
            {managementLinks.map((link) => (
              <Card
                key={link.screen}
                onPress={() => navigation.navigate(link.tab, { screen: link.screen })}
                style={{ marginBottom: 8 }}
                padding="medium"
              >
                <View style={styles.linkRow}>
                  <View style={[styles.linkIcon, { backgroundColor: link.color + '18' }]}>
                    <Ionicons name={link.icon} size={20} color={link.color} />
                  </View>
                  <Text style={[theme.typography.body, { flex: 1, color: theme.colors.textPrimary, marginLeft: 14 }]}>{link.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </View>
              </Card>
            ))}
          </FadeSlideIn>

          {/* ── Logout ───────────────────────────────────────────────── */}
          <FadeSlideIn delay={280}>
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.error + '40' }]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={[theme.typography.label, { color: theme.colors.error, marginLeft: 10, fontSize: 15 }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </FadeSlideIn>

        </View>
      </ScrollView>

      {/* ── Full-screen QR Modal ────────────────────────────────────── */}
      <Modal visible={qrModalVisible} transparent animationType="fade" onRequestClose={() => setQrModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setQrModalVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 4 }]}>
              {laundryName || 'UPI QR'}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 20 }]}>
              Scan with any UPI app to pay
            </Text>

            <View style={[styles.qrBig, { borderColor: theme.colors.borderLight, backgroundColor: qrBgColor }]}>
              <UpiQrCode value={upiQrValue} size={220} backgroundColor={qrBgColor} color={qrFgColor} />
            </View>

            <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginTop: 18, textAlign: 'center', fontWeight: '600' }]}>
              {upiId}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' }]}>
              Google Pay · PhonePe · Paytm · Any UPI app
            </Text>

            <TouchableOpacity style={[styles.copyBtn, { backgroundColor: theme.colors.primary }]} onPress={handleCopyUpi}>
              <Ionicons name="copy-outline" size={16} color="#FFF" />
              <Text style={[theme.typography.label, { color: '#FFF', marginLeft: 8 }]}>Copy UPI ID</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setQrModalVisible(false)} style={{ marginTop: 10, padding: 8 }}>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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

function InfoRow({ icon, label, value, theme }: { icon: any; label: string; value: string; theme: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}>
      <Ionicons name={icon} size={15} color={theme.colors.textSecondary} style={{ width: 20 }} />
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, width: 56, marginLeft: 8 }]}>{label}</Text>
      <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  unifiedHero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroAvatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  upiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  upiChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  editPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  upiDisplay: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1 },
  qrPreviewRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  qrPreviewThumb: { overflow: 'hidden' },
  chip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 8 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 28, borderRadius: 12, marginTop: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  linkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '85%', borderRadius: 24, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 12 },
  qrBig: { padding: 16, borderRadius: 16, borderWidth: 1 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 18, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
});
