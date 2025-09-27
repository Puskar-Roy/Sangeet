import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { SearchIcon } from '../../components/svgs/Search';
import Recommend, { RecommendItem } from '../../components/Home/Recommend';
import { useMusicSearch } from '../../hook/useSearch';
import { X } from 'lucide-react-native';
import { usePlayerStore } from '../../store/playerStore';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<TextInput | null>(null);

  // Get store methods - single call to avoid re-renders
  const {
    playFromBackend,
    statusMsg,
    loading,
    error: playerError,
    isPlaying,
    playingTrack,
  } = usePlayerStore();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchText.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const { data, isFetching, error, refetch } = useMusicSearch(debouncedQuery);

  const songs: RecommendItem[] = useMemo(() => {
    const cleaned = data?.cleaned ?? [];
    return cleaned.map((i: any) => ({
      id: i.id,
      title: i.title ?? i.originalTitle ?? 'Unknown',
      artist: i.channel ?? '',
      streams: i.duration ?? '',
      image: i.thumbnail ?? '',
      original: i.originalTitle,
      url: i.url,
      description: i.description,
      raw: i,
    }));
  }, [data]);

  const handleSearch = () => {
    // force immediate search on submit
    const q = searchText.trim();
    setDebouncedQuery(q);
    if (q) {
      refetch?.();
    }
    Keyboard.dismiss();
  };

  const handleSearchIconPress = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleItemPress = async (item: RecommendItem, isSaved: boolean) => {
    setSearchText(item.title);
    setDebouncedQuery(item.title);
    Keyboard.dismiss();

    // Play immediately using your backend with metadata
    try {
      console.log('🎵 Playing new song:', item.title);
      console.log('🎵 Current playing track:', playingTrack?.title);

      await playFromBackend(
        item.url,
        false, // false = replace queue and play now
        {
          title: item.title,
          artist: item.artist,
          artwork: item.image, // item.image contains the thumbnail
          description: item.description,
        },
      );
      console.log('✅ Successfully started playing:', item.title);
    } catch (error) {
      console.error('❌ Failed to play song:', error);
    }
  };

  const handleSaveToggle = async (item: RecommendItem, isSaved: boolean) => {
    // Add to queue (will play after current song)
    try {
      console.log('🎵 Adding to queue:', item.title);

      await playFromBackend(
        item.url,
        true, // true = add to queue
        {
          title: item.title,
          artist: item.artist,
          artwork: item.image, // item.image contains the thumbnail
          description: item.description,
        },
      );
      console.log('✅ Successfully added to queue:', item.title);
    } catch (error) {
      console.error('❌ Failed to add to queue:', error);
    }
  };

  const handleClear = () => {
    setSearchText('');
    setDebouncedQuery('');

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <View style={{ backgroundColor: '#0a071e', flex: 1 }}>
      {/* Debug info in development */}
      {__DEV__ && (playingTrack || loading) && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Now: {playingTrack?.title?.slice(0, 30) || 'None'} | Playing:{' '}
            {isPlaying ? 'YES' : 'NO'} | Loading: {loading ? 'YES' : 'NO'}
          </Text>
        </View>
      )}

      <View style={styles.listencontainer}>
        <View
          style={[
            styles.searchContainer,
            isSearchFocused && styles.searchContainerFocused,
          ]}
        >
          <TouchableOpacity
            onPress={handleSearchIconPress}
            style={styles.searchIconContainer}
            accessibilityLabel="Focus search"
          >
            <SearchIcon size={16} color={isSearchFocused ? '#fff' : '#888'} />
          </TouchableOpacity>

          <TextInput
            ref={searchInputRef}
            style={styles.input}
            placeholder="Search Music"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            blurOnSubmit={true}
          />

          <View style={styles.rightControls}>
            {isFetching || loading ? (
              <ActivityIndicator size="small" color={'#6156e2'} />
            ) : searchText.length > 0 ? (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}
                accessibilityLabel="Clear search"
              >
                <X size={18} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* Show player status */}
      {statusMsg && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusMsg}</Text>
          {playingTrack && (
            <Text style={[styles.statusText, { fontSize: 10, opacity: 0.8 }]}>
              {playingTrack.title} - {playingTrack.artist}
            </Text>
          )}
        </View>
      )}

      {/* Show player error */}
      {playerError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{playerError}</Text>
        </View>
      )}

      <View style={styles.searchResultContainer}>
        {isFetching && (
          <View style={styles.overlayContainer} pointerEvents="auto">
            <View style={styles.overlayCard}>
              <ActivityIndicator size="large" color={'#6156e2'} />
              <Text style={styles.overlayText}>Searching…</Text>
            </View>
          </View>
        )}

        {!isFetching && error && (
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ color: '#ff8080' }}>
              Error fetching results: {(error as Error).message}
            </Text>
          </View>
        )}

        <Recommend
          songs={songs}
          height={890}
          saveEnable={true}
          onItemPress={handleItemPress}
          onSaveToggle={handleSaveToggle}
        />
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  listencontainer: {
    width: '90%',
    marginHorizontal: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '50@ms',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A091E',
    borderRadius: 60,
    borderWidth: 1,
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    height: '40@vs',
    width: '90%',
    marginHorizontal: 'auto',
    borderColor: '#6156e2',
  },
  searchContainerFocused: {
    borderColor: '#fff',
    backgroundColor: '#1A1A2E',
  },
  searchIconContainer: {
    marginRight: '5@ms',
    padding: '2@ms',
  },
  rightControls: {
    marginLeft: '8@ms',
    marginRight: '2@ms',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineSpinner: {
    marginRight: '4@ms',
  },
  clearButton: {
    padding: '6@ms',
    borderRadius: 20,
  },
  searchResultContainer: {
    width: '90%',
    marginHorizontal: 'auto',
    marginTop: '30@ms',
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: '14@ms',
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'SSemiBold',
    paddingVertical: 0,
  },

  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: '5%',
    right: '5%',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,7,30,0.6)',
    zIndex: 999,
  },
  overlayCard: {
    minWidth: '160@ms',
    paddingVertical: '18@ms',
    paddingHorizontal: '18@ms',
    borderRadius: 12,
    backgroundColor: '#0a071e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  overlayText: {
    fontSize: '18@ms',
    color: '#fff',
    fontFamily: 'SSemiBold',
  },

  // Player status styles
  statusContainer: {
    paddingHorizontal: '5%',
    paddingVertical: '8@ms',
    backgroundColor: 'rgba(97, 86, 226, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#6156e2',
    marginHorizontal: '5%',
    borderRadius: 4,
    marginTop: '10@ms',
  },
  statusText: {
    color: '#6156e2',
    fontSize: '12@ms',
    fontFamily: 'SSemiBold',
  },
  errorContainer: {
    paddingHorizontal: '5%',
    paddingVertical: '8@ms',
    backgroundColor: 'rgba(255, 128, 128, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#ff8080',
    marginHorizontal: '5%',
    borderRadius: 4,
    marginTop: '10@ms',
  },
  errorText: {
    color: '#ff8080',
    fontSize: '12@ms',
    fontFamily: 'SSemiBold',
  },

  // Debug styles (development only)
  debugContainer: {
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
    paddingHorizontal: '5%',
    paddingVertical: '4@ms',
    marginHorizontal: '5%',
    borderRadius: 4,
    marginTop: '10@ms',
  },
  debugText: {
    color: '#ffff00',
    fontSize: '10@ms',
    fontFamily: 'SSemiBold',
  },
});