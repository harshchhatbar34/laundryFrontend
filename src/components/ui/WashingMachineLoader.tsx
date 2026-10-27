// FreshWash / LaundroFlow — WashingMachineLoader Component
// Updated to use the new FreshSpinLoader for a cohesive, modern experience

import React from 'react';
import FreshSpinLoader from './FreshSpinLoader';

interface WashingMachineLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const WashingMachineLoader: React.FC<WashingMachineLoaderProps> = ({
  message = '',
  size = 'medium',
}) => {
  return <FreshSpinLoader size={size} message={message} showDots={false} />;
};

export default React.memo(WashingMachineLoader);
