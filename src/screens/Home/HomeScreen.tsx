import { View } from 'react-native';
import React from 'react';
import {recommendData} from '../../lib/config'
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
      <Recommend
        songs={[]}
        height={300}
        saveEnable={true} // shows save icon and allows toggling
        onItemPress={(item, isSaved) => {
          // Tapped a song — receives full item + saved state
          console.log('play or navigate:', item, 'isSaved:', isSaved);
        }}
        onSaveToggle={(item, isSaved) => {
          // Called when user toggles save; useful to persist to backend/async storage
          console.log('save toggled', item.id, isSaved);
        }}
      />
    </View>
  );
}
