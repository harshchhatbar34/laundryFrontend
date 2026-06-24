import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { submitRating } from '../../api/ratings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/CustomerTabs';

type Props = NativeStackScreenProps<OrderStackParamList, 'Rating'>;

export default function RatingScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { orderId } = route.params;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      dispatch(showToast({ type: 'warning', message: 'Please select a star rating' }));
      return;
    }
    setLoading(true);
    try {
      await submitRating(orderId, rating, review);
      navigation.goBack();
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Rate Your Experience" showBack onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 8 }]}>
          How was your experience?
        </Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 28 }]}>
          Your feedback helps us improve
        </Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
              <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={40}
                color={star <= rating ? '#F59E0B' : theme.colors.border} />
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Write a review (optional)" value={review} onChangeText={setReview}
          multiline numberOfLines={4} style={{ marginTop: 24 }} />
        <Button title="Submit Review" onPress={handleSubmit} loading={loading} icon="send-outline"
          style={{ marginTop: 16 }} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 24 },
  stars: { flexDirection: 'row', justifyContent: 'center' },
  starBtn: { paddingHorizontal: 6 },
});
