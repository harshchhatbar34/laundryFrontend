import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { APP_NAME } from '../utils/constants';
import BubbleLoader from '../animations/BubbleLoader';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigation, logoOpacity, logoScale]);

  return (
    <LinearGradient colors={theme.gradients.ocean as any} style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Text style={styles.logoEmoji}>🧺</Text>
        <Text style={[theme.typography.displayLarge, styles.appName]}>{APP_NAME}</Text>
        <Text style={[theme.typography.body, styles.tagline]}>Laundry made effortless</Text>
      </Animated.View>
      <View style={styles.loader}>
        <BubbleLoader size="medium" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center' },
  logoEmoji: { fontSize: 72, marginBottom: 12 },
  appName: { color: '#FFFFFF', marginBottom: 4 },
  tagline: { color: 'rgba(255,255,255,0.7)' },
  loader: { position: 'absolute', bottom: 100 },
});
