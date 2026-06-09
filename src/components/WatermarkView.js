import { Image, StyleSheet } from 'react-native';

export default function WatermarkView() {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={styles.watermark}
      resizeMode="contain"
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.05,
    zIndex: -1,
  }
});
