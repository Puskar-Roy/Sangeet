// import { View, Text, Image, Alert } from 'react-native';
// import React, { useCallback, useRef } from 'react';
// import { ScaledSheet } from 'react-native-size-matters';
// import { Fonts } from '../../styles/fonts';
// import Slider from '@react-native-community/slider';
// import {
//   Play,
//   Pause,
//   Rewind,
//   SkipForward,
//   SkipBack,
//   Heart,
//   Shuffle,
// } from 'lucide-react-native';
// import { usePlayerStore } from '../../store/playerStore';

// export default function PlayerScreen() {
//   return (
//     <View style={{ backgroundColor: '#0a071e', flex: 1 }}>
//       <View style={styles.listencontainer}>
//         <View style={[styles.center, styles.m20]}>
//           <View>
//             <Image
//               source={{
//                 uri: 'https://i1.sndcdn.com/artworks-0OCvUJsDq9W55CiU-c5pxiw-t500x500.jpg',
//               }}
//               style={styles.musicImage}
//               alt="Music Lable"
//             />
//           </View>
//           <View style={[styles.center, styles.m50]}>
//             <Text style={styles.musicHeading}>For A Reason</Text>
//             <Text style={styles.musicArtist}>Karan Aujla</Text>
//           </View>
//           <View style={[styles.m40, { width: '100%' }]}>
//             <Slider
//               style={styles.slider}
//               minimumValue={0}
//               maximumValue={10}
//               value={2}
//               minimumTrackTintColor="#6156e2"
//               maximumTrackTintColor="#f2f2f2"
//               thumbTintColor="#6156e2"
//               onSlidingComplete={() => {}}
//             />
//             <View
//               style={[
//                 styles.center,
//                 {
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   width: '90%',
//                   marginHorizontal: 'auto',
//                 },
//               ]}
//             >
//               <Heart stroke={'#C6C6C6'} fill={'none'} />
//               <SkipBack color={'#fff'} />
//               <View style={[styles.center, styles.playButton]}>
//                 <Pause color={'#fff'} />
//               </View>
//               <SkipForward color={'#fff'} />
//               <Shuffle color={'#fff'} />
//             </View>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = ScaledSheet.create({
//   contentContainer: {
//     flex: 1,
//     padding: 36,
//     alignItems: 'center',
//   },
//   listencontainer: {
//     width: '90%',
//     marginHorizontal: 'auto',
//     display: 'flex',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: '70@vs',
//   },
//   center: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   musicImage: {
//     width: '300@s',
//     height: '300@s',
//     borderRadius: '15@ms',
//   },
//   musicHeading: {
//     fontSize: '30@ms',
//     color: '#fff',
//     fontFamily: Fonts.Regular,
//   },
//   musicArtist: {
//     fontSize: '20@ms',
//     color: '#8e8e8e',
//     fontFamily: Fonts.Regular,
//   },
//   slider: {
//     height: '40@ms',
//   },
//   playButton: {
//     backgroundColor: '#6156e2',
//     height: '60@ms',
//     width: '60@ms',
//     borderRadius: '20@ms',
//   },
//   m20: {
//     marginTop: '10@ms',
//   },
//   m40: {
//     marginTop: '30@ms',
//   },
//   m50: {
//     marginTop: '50@ms',
//   },
// });

import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { Fonts } from '../../styles/fonts';
import Slider from '@react-native-community/slider';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Shuffle,
  Volume2,
  Repeat,
} from 'lucide-react-native';
import { usePlayerStore, useCurrentTrack } from '../../store/playerStore';

export default function PlayerScreen() {
  const {
    // Current track info
    queue,
    currentIndex,
    playingTrack,

    // Playback state
    isPlaying,
    position,
    duration,
    loading,
    error,

    // Settings
    shuffle,
    repeat,

    // Actions
    togglePlayPause,
    playNext,
    playPrev,
    seekTo,
    toggleShuffle,
    setRepeat,

    // Status
    statusMsg,
  } = usePlayerStore();

  // Use the helper hook for current track
  const currentTrack = useCurrentTrack();

  // Debug logs (only in development)
  useEffect(() => {
    if (__DEV__) {
      console.log('PlayerScreen Debug:', {
        currentIndex,
        queueLength: queue?.length,
        currentTrack: currentTrack?.title,
        playingTrack: playingTrack?.title,
        isPlaying,
        loading,
        position: Math.floor(position / 1000),
        duration: Math.floor(duration / 1000),
      });
    }
  }, [
    currentIndex,
    queue?.length,
    currentTrack,
    playingTrack,
    isPlaying,
    loading,
    position,
    duration,
  ]);

  // Convert milliseconds to seconds for display
  const currentTimeSeconds = Math.floor(position / 1000);
  const durationSeconds = Math.floor(duration / 1000);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    if (seconds < 0 || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle slider value change
  const handleSeek = useCallback(
    (value: number) => {
      if (currentTrack && !loading) {
        seekTo(value);
      }
    },
    [seekTo, currentTrack, loading],
  );

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (!currentTrack || loading) return;

    try {
      await togglePlayPause();
    } catch (error) {
      console.error('Play/Pause error:', error);
      Alert.alert('Playback Error', 'Failed to toggle playback');
    }
  }, [togglePlayPause, currentTrack, loading]);

  // Handle next track
  const handleNext = useCallback(async () => {
    if (!currentTrack || loading) return;

    try {
      await playNext();
    } catch (error) {
      console.error('Next track error:', error);
      Alert.alert('Playback Error', 'Failed to play next track');
    }
  }, [playNext, currentTrack, loading]);

  // Handle previous track
  const handlePrevious = useCallback(async () => {
    if (!currentTrack || loading) return;

    try {
      await playPrev();
    } catch (error) {
      console.error('Previous track error:', error);
      Alert.alert('Playback Error', 'Failed to play previous track');
    }
  }, [playPrev, currentTrack, loading]);

  // Handle shuffle toggle
  const handleShuffle = useCallback(() => {
    toggleShuffle();
  }, [toggleShuffle]);

  // Handle repeat mode cycle
  const handleRepeat = useCallback(() => {
    const modes = ['off', 'one', 'all'] as const;
    const currentModeIndex = modes.indexOf(repeat);
    const nextIndex = (currentModeIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  }, [repeat, setRepeat]);

  // Show error if there's one
  useEffect(() => {
    if (error) {
      console.error('Player error:', error);
      Alert.alert('Player Error', error);
    }
  }, [error]);

  // Determine which track to display
  // Priority: playingTrack > currentTrack > fallback
  const displayTrack = playingTrack ||
    currentTrack || {
      title: 'No Track Selected',
      artist: 'Select a song to play',
      artwork: 'https://avatars.githubusercontent.com/u/113108193?v=4',
    };

  // Get repeat icon color based on mode
  const getRepeatColor = () => {
    switch (repeat) {
      case 'one':
        return '#6156e2';
      case 'all':
        return '#6156e2';
      default:
        return '#C6C6C6';
    }
  };

  // Show queue info - handle edge case when no tracks
  const queueDisplayText =
    queue.length > 0
      ? `${Math.max(0, currentIndex) + 1} of ${queue.length}`
      : '0 of 0';

  // Check if controls should be disabled
  const controlsDisabled = !currentTrack || loading;

  return (
    <View style={{ backgroundColor: '#0a071e', flex: 1 }}>
      <View style={styles.listencontainer}>
        <View style={[styles.center, styles.m20]}>
          {/* Track Artwork */}
          <View style={styles.artworkContainer}>
            <Image
              source={{
                uri: displayTrack.artwork,
              }}
              style={styles.musicImage}
              defaultSource={{
                uri: 'https://avatars.githubusercontent.com/u/113108193?v=4',
              }}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
          </View>

          {/* Track Info */}
          <View style={[styles.center, styles.m50]}>
            <Text style={styles.musicHeading} numberOfLines={2}>
              {displayTrack.title}
            </Text>
            <Text style={styles.musicArtist} numberOfLines={1}>
              {displayTrack.artist}
            </Text>
            {statusMsg ? (
              <Text style={styles.statusText}>{statusMsg}</Text>
            ) : null}

            {/* Debug info in development */}
            {__DEV__ && (
              <Text style={styles.debugText}>
                Playing: {playingTrack?.title?.slice(0, 20) || 'None'} | Index:{' '}
                {currentIndex} | Queue: {queue?.length || 0}
              </Text>
            )}
          </View>

          {/* Progress Slider and Controls */}
          <View style={[styles.m40, { width: '100%' }]}>
            {/* Progress Slider */}
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={Math.max(durationSeconds || 100, 1)}
              value={Math.min(currentTimeSeconds, durationSeconds || 0)}
              minimumTrackTintColor="#6156e2"
              maximumTrackTintColor="#f2f2f2"
              thumbTintColor="#6156e2"
              onSlidingComplete={handleSeek}
              disabled={controlsDisabled}
            />

            {/* Time Display */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTimeSeconds)}
              </Text>
              <Text style={styles.timeText}>{formatTime(durationSeconds)}</Text>
            </View>

            {/* Control Buttons */}
            <View style={styles.controlsContainer}>
              {/* Heart/Like Button */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  Alert.alert(
                    'Feature',
                    'Like functionality not implemented yet',
                  );
                }}
              >
                <Heart stroke={'#C6C6C6'} fill={'none'} size={24} />
              </TouchableOpacity>

              {/* Previous Button */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePrevious}
                disabled={controlsDisabled}
              >
                <SkipBack
                  color={controlsDisabled ? '#666' : '#fff'}
                  size={28}
                />
              </TouchableOpacity>

              {/* Play/Pause Button */}
              <TouchableOpacity
                style={[
                  styles.center,
                  styles.playButton,
                  controlsDisabled && styles.disabledButton,
                ]}
                onPress={handlePlayPause}
                disabled={controlsDisabled}
              >
                {loading ? (
                  <Text style={styles.loadingText}>⟳</Text>
                ) : isPlaying ? (
                  <Pause color={'#fff'} size={32} />
                ) : (
                  <Play color={'#fff'} size={32} />
                )}
              </TouchableOpacity>

              {/* Next Button */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleNext}
                disabled={controlsDisabled}
              >
                <SkipForward
                  color={controlsDisabled ? '#666' : '#fff'}
                  size={28}
                />
              </TouchableOpacity>

              {/* Shuffle Button */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleShuffle}
              >
                <Shuffle color={shuffle ? '#6156e2' : '#C6C6C6'} size={24} />
              </TouchableOpacity>
            </View>

            {/* Secondary Controls */}
            <View style={styles.secondaryControlsContainer}>
              {/* Repeat Button */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleRepeat}
              >
                <Repeat color={getRepeatColor()} size={20} />
                {repeat === 'one' && (
                  <Text style={styles.repeatOneIndicator}>1</Text>
                )}
              </TouchableOpacity>

              {/* Queue Info */}
              <Text style={styles.queueInfo}>{queueDisplayText}</Text>

              {/* Volume/More Options */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  Alert.alert('Feature', 'Volume controls not implemented yet');
                }}
              >
                <Volume2 color={'#C6C6C6'} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  listencontainer: {
    width: '90%',
    marginHorizontal: 'auto',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '20@vs',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {
    position: 'relative',
  },
  musicImage: {
    width: '300@s',
    height: '300@s',
    borderRadius: '15@ms',
    backgroundColor: '#1a1a1a', // Fallback background
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '15@ms',
  },
  loadingText: {
    color: '#fff',
    fontSize: '16@ms',
    fontFamily: Fonts.Regular,
  },
  musicHeading: {
    fontSize: '30@ms',
    color: '#fff',
    fontFamily: Fonts.Regular,
    textAlign: 'center',
    marginBottom: '5@ms',
  },
  musicArtist: {
    fontSize: '20@ms',
    color: '#8e8e8e',
    fontFamily: Fonts.Regular,
    textAlign: 'center',
  },
  statusText: {
    fontSize: '14@ms',
    color: '#6156e2',
    fontFamily: Fonts.Regular,
    textAlign: 'center',
    marginTop: '10@ms',
  },
  debugText: {
    fontSize: '10@ms',
    color: '#ffff00',
    fontFamily: Fonts.Regular,
    textAlign: 'center',
    marginTop: '5@ms',
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
    padding: '2@ms',
    borderRadius: '2@ms',
  },
  slider: {
    height: '40@ms',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginHorizontal: 'auto',
    marginTop: '5@ms',
    marginBottom: '20@ms',
  },
  timeText: {
    color: '#C6C6C6',
    fontSize: '14@ms',
    fontFamily: Fonts.Regular,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginHorizontal: 'auto',
  },
  controlButton: {
    padding: '10@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#6156e2',
    height: '60@ms',
    width: '60@ms',
    borderRadius: '30@ms',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  secondaryControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '70%',
    marginHorizontal: 'auto',
    marginTop: '20@ms',
  },
  repeatOneIndicator: {
    position: 'absolute',
    color: '#6156e2',
    fontSize: '10@ms',
    fontWeight: 'bold',
    top: '15@ms',
    right: '8@ms',
  },
  queueInfo: {
    color: '#8e8e8e',
    fontSize: '12@ms',
    fontFamily: Fonts.Regular,
  },
  m20: {
    marginTop: '10@ms',
  },
  m40: {
    marginTop: '25@ms',
  },
  m50: {
    marginTop: '15@ms',
  },
});