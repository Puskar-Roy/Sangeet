import { View } from 'react-native';
import React from 'react';

import Header from '../../components/Home/Header';
import RecentlyPlayed from '../../components/Home/RecentlyPlayed';
import Recommend from '../../components/Home/Recommend';
export default function HomeScreen() {
  return (
    <View
      style={{ minHeight: '120%', backgroundColor: '#0a071e', marginTop: 50 }}
    >
      <Header name="Puskar Roy" member="Gold Member" />
      <RecentlyPlayed />
      <Recommend />
    </View>
  );
}
