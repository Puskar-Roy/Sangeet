import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';

type RecommendItem = {
  id: string;
  title: string;
  artist: string;
  streams: string;
  image: any;
};

const recommendData: RecommendItem[] = [
  {
    id: '1',
    title: 'Take care of you',
    artist: 'Admina Thembi',
    streams: '114k / steams',
    image: require('../../../assets/music/image.png'),
  },
  {
    id: '2',
    title: 'The stranger inside you',
    artist: 'Jeane Lebras',
    streams: '60.5k / steams',
    image: require('../../../assets/music/image.png'),
  },
  {
    id: '3',
    title: 'Edwall of beauty mind',
    artist: 'Jacob Givson',
    streams: '44.3k / steams',
    image: require('../../../assets/music/image.png'),
  },
];

export default function Recommend() {
  const renderItem: ListRenderItem<RecommendItem> = ({ item }) => (
    <TouchableOpacity style={styles.recommendItem} activeOpacity={0.8}>
      <Image
        source={item.image}
        style={styles.recommendImage}
        resizeMode="cover"
      />
      <View style={styles.recommendTextContainer}>
        <Text style={styles.recommendTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.recommendArtist} numberOfLines={1}>
          {item.artist}
        </Text>
        <Text style={styles.recommendStreams} numberOfLines={1}>
          {item.streams}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.maincontainer}>
        <Text style={styles.fourthtext}>Recommend for you</Text>

        <FlatList
          data={recommendData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          style={styles.flatListStyle}
        />
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  wrapper: {
    marginTop: '00@vs',
  },
  maincontainer: {
    width: '90%',
    marginHorizontal: 'auto',
    flexDirection: 'column',
  },
  fourthtext: {
    fontSize: '22@ms',
    color: '#fff',
    fontFamily: 'SSemiBold',
    marginBottom: '20@vs',
  },
  flatListStyle: {
    height:'250@s'
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '8@vs',
  },
  recommendImage: {
    width: '60@s',
    height: '60@vs',
    borderRadius: '12@ms',
  },
  recommendTextContainer: {
    flex: 1,
    marginLeft: '16@s',
    justifyContent: 'center',
  },
  recommendTitle: {
    fontSize: '16@ms',
    color: '#fff',
    fontFamily: 'SSemiBold',
    marginBottom: '2@vs',
  },
  recommendArtist: {
    fontSize: '14@ms',
    color: '#C6C6C6',
    fontFamily: 'SSemiBold',
    marginBottom: '2@vs',
  },
  recommendStreams: {
    fontSize: '12@ms',
    color: '#888',
    fontFamily: 'SRegular',
  },
  itemSeparator: {
    height: '12@vs',
  },
});
