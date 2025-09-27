
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { Heart as SaveIcon } from 'lucide-react-native';

export type RecommendItem = {
  id: string;
  title: string;
  artist?: string;
  streams?: string;
  image?: any | string;
  [key: string]: any;
};

type Props = {
  songs: RecommendItem[]; 
  height?: number;
  onItemPress?: (item: RecommendItem, isSaved: boolean) => void;
  saveEnable?: boolean;
  savedIds?: string[] | null;
  onSaveToggle?: (item: RecommendItem, isSaved: boolean) => void;
  ListHeaderComponent?: React.ComponentType<any> | null;
  ListEmptyComponent?: React.ComponentType<any> | null;
};

export default function Recommend({
  songs,
  height,
  onItemPress,
  saveEnable = false,
  savedIds,
  onSaveToggle,
  ListHeaderComponent,
  ListEmptyComponent,
}: Props) {

  const [localSavedSet, setLocalSavedSet] = useState<Set<string>>(new Set());
  const isSaved = useCallback(
    (id: string) => {
      if (Array.isArray(savedIds)) {
        return savedIds.includes(id);
      }
      return localSavedSet.has(id);
    },
    [savedIds, localSavedSet],
  );

  const toggleSave = useCallback(
    (item: RecommendItem) => {
      const id = item.id;
      const currentlySaved = isSaved(id);
      const newSaved = !currentlySaved;

      if (Array.isArray(savedIds)) {
        onSaveToggle?.(item, newSaved);
      } else {
        setLocalSavedSet(prev => {
          const next = new Set(prev);
          if (newSaved) next.add(id);
          else next.delete(id);
          return next;
        });
        onSaveToggle?.(item, newSaved);
      }
    },
    [isSaved, onSaveToggle, savedIds],
  );

  const handleItemPress = useCallback(
    (item: RecommendItem) => (_e?: GestureResponderEvent) => {
      const saved = isSaved(item.id);
      onItemPress?.(item, saved);
    },
    [isSaved, onItemPress],
  );

  const renderItem: ListRenderItem<RecommendItem> = ({ item }) => {
    const source =
      typeof item.image === 'string' ? { uri: item.image } : item.image;

    const saved = isSaved(item.id);

    return (
      <TouchableOpacity
        style={styles.recommendItem}
        activeOpacity={0.8}
        onPress={handleItemPress(item)}
      >
        <Image
          source={source ?? require('../../../assets/music/image.png')}
          style={styles.recommendImage}
          resizeMode="cover"
        />

        <View style={styles.recommendTextContainer}>
          <Text style={styles.recommendTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.recommendArtist} numberOfLines={1}>
            {item.artist ?? ''}
          </Text>
          {item.streams ? (
            <Text style={styles.recommendStreams} numberOfLines={1}>
              {item.streams}
            </Text>
          ) : null}
        </View>

        {saveEnable && (
          <Pressable
            onPress={() => toggleSave(item)}
            style={styles.saveButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
           
            <SaveIcon
              width={18}
              height={18}
              stroke={saved ? '#db0000' : '#C6C6C6'}
              fill={saved ? '#db0000' : 'none'}
              strokeWidth={saved ? 1.6 : 1.2}
            />
          </Pressable>
        )}
      </TouchableOpacity>
    );
  };

  const DefaultEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No songs available</Text>
    </View>
  );

  const data = songs ?? []; // songs is required by type, but guard anyway

  return (
    <View style={styles.wrapper}>
      <View style={styles.maincontainer}>
        <Text style={styles.fourthtext}>Recommend for you</Text>

        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          style={[styles.flatListStyle, height ? { height } : undefined]}
          ListHeaderComponent={ListHeaderComponent ?? undefined}
          ListEmptyComponent={ListEmptyComponent ?? DefaultEmpty}
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
    height: '250@s',
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
  emptyContainer: {
    paddingVertical: '24@vs',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: '14@ms',
  },

  /* save button */
  saveButton: {
    padding: '6@ms',
    marginLeft: '8@s',
  },
});
