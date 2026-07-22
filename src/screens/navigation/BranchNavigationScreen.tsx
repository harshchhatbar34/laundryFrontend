// LaundroFlow — BranchNavigationScreen
// Shows a navigation map from the user's current location to a branch.
// Used by customers from the BranchCatalogScreen.

import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/CustomerTabs';
import NavigationMapView from '../../components/map/NavigationMapView';

type Props = NativeStackScreenProps<HomeStackParamList, 'BranchNavigation'>;

export default function BranchNavigationScreen({ route, navigation }: Props) {
  const { branch } = route.params;

  // Branch location is stored as GeoJSON [lng, lat]
  if (__DEV__) console.log('[BranchNavigation] Branch:', branch?.name, 'Coords:', branch?.location?.coordinates);
  
  const destination = {
    latitude: Number(branch.location.coordinates[1]),
    longitude: Number(branch.location.coordinates[0]),
  };

  return (
    <NavigationMapView
      destination={destination}
      destinationLabel={branch.name || 'Branch'}
      destinationSubLabel={[branch.addressLine, branch.city].filter(Boolean).join(', ')}
      onBack={() => navigation.goBack()}
    />
  );
}
