import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ListRenderItem,
  Image,
  TouchableOpacity,
} from 'react-native';
import React from 'react';

const { width } = Dimensions.get('window');

type MusicItem = {
  id: string;
  title: string;
  artist: string;
  image: any; 
};

const data: MusicItem[] = [
  {
    id: '1',
    title: 'Safety tips',
    artist: 'Cloud Monkey',
    image: require('../../../assets/music/image.png'),
  },
  {
    id: '2',
    title: 'Summer Vibes',
    artist: 'Ocean Beats',
    image: require('../../../assets/music/image.png'),
  },
  {
    id: '3',
    title: 'Night Drive',
    artist: 'Neon Dreams',
    image: require('../../../assets/music/image.png'),
  },
  {
    id: '4',
    title: 'Morning Coffee',
    artist: 'Jazz Cafe',
    image: require('../../../assets/music/image.png'),
  },
];

export default function RecentMusics() {
  const renderItem: ListRenderItem<MusicItem> = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.artistText} numberOfLines={1}>
          {item.artist}
        </Text>
        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
     

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 20,
    fontFamily: 'SSemiBold', // Use your custom font if available
  },
  seeAllText: {
    color: '#C6C6C6',
    fontWeight: '400',
    fontSize: 14,
  },
  flatListContent: {
    paddingHorizontal: 4,
  },
  card: {
    width: 140,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    paddingHorizontal: 4,
  },
  artistText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
    fontFamily: 'SSemiBold', 
    alignSelf:"center"
  },
  titleText: {
    color: '#C6C6C6',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'SRegular',
    alignSelf:"center"
  },
  separator: {
    width: 16,
  },
});
