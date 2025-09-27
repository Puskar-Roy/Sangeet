import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AudioPro } from 'react-native-audio-pro';

/**
 * Track shape - matches AudioPro expected format
 */
export interface Track {
  id: string;
  url: string; // The stream URL (HLS or direct)
  title: string;
  artist: string;
  artwork?: string;
  description?: string;
  duration?: number;
  streams?: string | number;
  source?: 'hls' | 'direct' | 'queued';
  raw?: any;
}

/**
 * Repeat mode
 */
export type RepeatMode = 'off' | 'one' | 'all';

/**
 * AudioPro play options
 */
interface PlayOptions {
  autoPlay?: boolean;
}

// URL validation helper
const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('file://')
  );
};

// Track validation helper
const isValidTrack = (track: Track): boolean => {
  if (!track || !track.id || !track.title || !track.artist) {
    return false;
  }

  // Check if URL is valid
  if (!track.url || !isValidUrl(track.url)) {
    return false;
  }

  // If artwork is provided, it must be a valid URL or empty string
  if (track.artwork && track.artwork !== '' && !isValidUrl(track.artwork)) {
    return false;
  }

  return true;
};

interface PlayerState {
  // State
  queue: Track[];
  currentIndex: number; // -1 when nothing
  isPlaying: boolean;
  position: number; // milliseconds (AudioPro uses ms)
  duration: number; // milliseconds
  shuffle: boolean;
  repeat: RepeatMode;
  loading: boolean; // true while loading a track
  error: string | null;
  playingTrack: Track | null; // Current playing track from AudioPro
  statusMsg: string; // Status message for UI feedback

  // Internal state
  pollingInterval: NodeJS.Timeout | null; // For manual state polling

  // Actions
  setQueue: (tracks: Track[], startAt?: number) => void;
  addToQueue: (track: Track, playImmediate?: boolean) => Promise<void>;
  addToQueueAtNext: (track: Track) => void;
  playTrackNow: (index: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrev: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  pausePlayback: () => void;
  resumePlayback: () => void;
  seekTo: (seconds: number) => Promise<void>;
  clearQueue: () => Promise<void>;
  removeAt: (index: number) => void;
  toggleShuffle: () => void;
  setRepeat: (mode: RepeatMode) => void;

  // Backend integration
  playFromBackend: (
    originalUrl: string,
    addToQueue?: boolean,
    metadata?: {
      title?: string;
      artist?: string;
      artwork?: string;
      description?: string;
    },
  ) => Promise<void>;

  // Sync with AudioPro events
  syncAudioProState: (event: {
    type: string;
    payload?: any;
    track?: Track;
  }) => void;

  // Initialize AudioPro listener
  initializeAudioProListener: () => void;

  // Manual state polling as fallback
  startStatePolling: () => void;
  stopStatePolling: () => void;
}

const initialState = {
  queue: [] as Track[],
  currentIndex: -1,
  isPlaying: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeat: 'off' as RepeatMode,
  loading: false,
  error: null as string | null,
  playingTrack: null as Track | null,
  statusMsg: '',
  pollingInterval: null as NodeJS.Timeout | null,
};

export const usePlayerStore = create<PlayerState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setQueue: (tracks: Track[], startAt = 0): void => {
          const validTracks = tracks.filter(track => {
            const valid = isValidTrack(track);
            if (!valid) {
              console.warn('Invalid track filtered out:', track);
            }
            return valid;
          });

          const validStartAt =
            startAt >= 0 && startAt < validTracks.length ? startAt : -1;
          set({
            queue: validTracks,
            currentIndex: validTracks.length > 0 ? validStartAt : -1,
            error: null,
          });
        },

        addToQueue: async (
          track: Track,
          playImmediate = false,
        ): Promise<void> => {
          const state = get();
          if (!state) return;

          if (!isValidTrack(track)) {
            console.error('Invalid track, cannot add to queue:', track);
            set({
              error: 'Invalid track: missing required fields or invalid URL',
            });
            return;
          }

          const newQueue = [...(state.queue || []), track];
          set({ queue: newQueue });

          if (playImmediate) {
            const newIndex = newQueue.length - 1;
            await get().playTrackNow(newIndex);
          }
        },

        addToQueueAtNext: (track: Track): void => {
          const state = get();
          if (!state || !Array.isArray(state.queue)) return;

          if (!isValidTrack(track)) {
            console.error('Invalid track, cannot add to queue at next:', track);
            set({
              error: 'Invalid track: missing required fields or invalid URL',
            });
            return;
          }

          const nextIndex = Math.max(0, (state.currentIndex || 0) + 1);
          const newQueue = [...state.queue];
          newQueue.splice(nextIndex, 0, track);
          set({ queue: newQueue });
        },

        playTrackNow: async (index: number): Promise<void> => {
          const state = get();

          if (
            !state ||
            !Array.isArray(state.queue) ||
            index < 0 ||
            index >= state.queue.length
          ) {
            set({ error: 'Invalid track index or queue state' });
            return;
          }

          const track = state.queue[index];
          if (!isValidTrack(track)) {
            set({
              error: 'Invalid track: missing required fields or invalid URL',
            });
            return;
          }

          try {
            // CRITICAL FIX: Stop current playback explicitly before starting new track
            console.log(
              'Stopping current playback before starting new track...',
            );
            try {
              await AudioPro.stop(); // Explicitly stop current track
              await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure stop completes
            } catch (stopError) {
              console.warn('Error stopping previous track:', stopError);
            }

            set({
              loading: true,
              error: null,
              statusMsg: 'Loading track...',
              currentIndex: index,
              playingTrack: track,
              isPlaying: false, // Reset playing state
            });

            // Ensure artwork is valid
            const artwork =
              track.artwork && isValidUrl(track.artwork)
                ? track.artwork
                : 'https://avatars.githubusercontent.com/u/113108193?v=4';

            // CRITICAL FIX: Create more unique track ID based on URL and timestamp
            const uniqueTrackId = `${
              track.source || 'track'
            }-${Date.now()}-${track.url
              .slice(-10)
              .replace(/[^a-zA-Z0-9]/g, '')}`;

            const trackToPlay = {
              id: uniqueTrackId, // Use more unique ID
              url: track.url,
              title: track.title,
              artist: track.artist,
              artwork: artwork,
            };

            console.log('Playing new track:', trackToPlay);
            console.log('Previous track cleared, starting fresh playback...');

            // Start new track playback
            await AudioPro.play(trackToPlay, { autoPlay: true } as PlayOptions);

            // Update the track in our queue with the new unique ID for consistency
            const updatedQueue = [...state.queue];
            updatedQueue[index] = { ...track, id: uniqueTrackId };
            set({
              queue: updatedQueue,
              playingTrack: { ...track, id: uniqueTrackId },
            });

            // CRITICAL FIX: Add fallback timer to prevent stuck loading
            // If no events are received within 5 seconds, start manual polling
            setTimeout(() => {
              const currentState = get();
              if (currentState.loading && currentState.currentIndex === index) {
                console.warn(
                  'No AudioPro events received after 5 seconds, starting fallback polling',
                );
                get().startStatePolling();

                // Also manually update state after 10 seconds if still loading
                setTimeout(() => {
                  const stillLoadingState = get();
                  if (
                    stillLoadingState.loading &&
                    stillLoadingState.currentIndex === index
                  ) {
                    console.warn(
                      'Still loading after 10 seconds, assuming playback started',
                    );
                    set({
                      loading: false,
                      isPlaying: true,
                      statusMsg: 'Playing (assumed)',
                      error: null,
                    });
                  }
                }, 5000); // Additional 5 seconds
              }
            }, 5000); // Start fallback after 5 seconds
          } catch (error: any) {
            console.error('playTrackNow error:', error);
            set({
              loading: false,
              error: error?.message || 'Playback failed',
              isPlaying: false,
              statusMsg: 'Playback failed',
            });
          }
        },

        playNext: async (): Promise<void> => {
          const state = get();
          if (!state || !Array.isArray(state.queue)) return;

          let nextIndex = (state.currentIndex || 0) + 1;

          if (state.shuffle && state.queue.length > 1) {
            const availableIndices = state.queue
              .map((_, i) => i)
              .filter(
                i => i !== state.currentIndex && isValidTrack(state.queue[i]),
              );

            if (availableIndices.length > 0) {
              nextIndex =
                availableIndices[
                  Math.floor(Math.random() * availableIndices.length)
                ];
            }
          } else {
            while (
              nextIndex < state.queue.length &&
              !isValidTrack(state.queue[nextIndex])
            ) {
              nextIndex++;
            }
          }

          if (
            nextIndex < state.queue.length &&
            isValidTrack(state.queue[nextIndex])
          ) {
            await get().playTrackNow(nextIndex);
          } else if (state.repeat === 'all' && state.queue.length > 0) {
            const firstValidIndex = state.queue.findIndex(track =>
              isValidTrack(track),
            );
            if (firstValidIndex !== -1) {
              await get().playTrackNow(firstValidIndex);
            }
          } else {
            set({ isPlaying: false, playingTrack: null });
          }
        },

        playPrev: async (): Promise<void> => {
          const state = get();
          if (!state || typeof state.currentIndex !== 'number') return;

          let prevIndex = state.currentIndex - 1;
          while (prevIndex >= 0 && !isValidTrack(state.queue[prevIndex])) {
            prevIndex--;
          }

          if (prevIndex >= 0 && isValidTrack(state.queue[prevIndex])) {
            await get().playTrackNow(prevIndex);
          } else if (state.repeat === 'all' && state.queue?.length > 0) {
            let lastValidIndex = state.queue.length - 1;
            while (
              lastValidIndex >= 0 &&
              !isValidTrack(state.queue[lastValidIndex])
            ) {
              lastValidIndex--;
            }
            if (lastValidIndex >= 0) {
              await get().playTrackNow(lastValidIndex);
            }
          }
        },

        togglePlayPause: async (): Promise<void> => {
          const state = get();
          if (
            !state ||
            state.currentIndex === -1 ||
            !state.queue[state.currentIndex]
          )
            return;

          try {
            if (state.isPlaying) {
              get().pausePlayback();
            } else {
              get().resumePlayback();
            }
          } catch (error) {
            console.error('togglePlayPause error:', error);
            set({ error: 'Failed to toggle playback' });
          }
        },

        pausePlayback: (): void => {
          try {
            AudioPro.pause();
            set({ isPlaying: false, statusMsg: 'Paused' });
          } catch (error) {
            console.warn('pause error:', error);
          }
        },

        resumePlayback: (): void => {
          try {
            AudioPro.resume();
            set({ isPlaying: true, statusMsg: 'Playing' });
          } catch (error) {
            console.warn('resume error:', error);
          }
        },

        seekTo: async (seconds: number): Promise<void> => {
          try {
            if (typeof (AudioPro as any).seek === 'function') {
              await (AudioPro as any).seek(seconds * 1000);
              set({ position: seconds * 1000 });
            }
          } catch (error) {
            console.error('seekTo error:', error);
          }
        },

        clearQueue: async (): Promise<void> => {
          try {
            await AudioPro.stop();
          } catch (error) {
            console.warn('Failed to stop during clear:', error);
          }

          // Stop polling
          get().stopStatePolling();

          set({
            queue: [],
            currentIndex: -1,
            isPlaying: false,
            position: 0,
            duration: 0,
            loading: false,
            error: null,
            playingTrack: null,
            statusMsg: 'Queue cleared',
          });
        },

        removeAt: (index: number): void => {
          const state = get();
          if (
            !state ||
            !Array.isArray(state.queue) ||
            index < 0 ||
            index >= state.queue.length
          )
            return;

          const newQueue = [...state.queue];
          newQueue.splice(index, 1);

          let newCurrentIndex = state.currentIndex || 0;
          if (index < newCurrentIndex) {
            newCurrentIndex = newCurrentIndex - 1;
          } else if (index === newCurrentIndex) {
            if (newQueue.length === 0) {
              newCurrentIndex = -1;
            } else if (newCurrentIndex >= newQueue.length) {
              newCurrentIndex = newQueue.length - 1;
            }
          }

          set({
            queue: newQueue,
            currentIndex: newCurrentIndex,
            playingTrack:
              newCurrentIndex >= 0 ? newQueue[newCurrentIndex] : null,
          });
        },

        toggleShuffle: (): void => {
          const state = get();
          if (state) set({ shuffle: !state.shuffle });
        },

        setRepeat: (mode: RepeatMode): void => {
          set({ repeat: mode });
        },

        playFromBackend: async (
          originalUrl: string,
          addToQueue = false,
          metadata?: {
            title?: string;
            artist?: string;
            artwork?: string;
            description?: string;
          },
        ): Promise<void> => {
          try {
            set({
              loading: true,
              error: null,
              statusMsg: 'Fetching from backend...',
            });

            const backendUrl = `https://audio.poolu.fun/api/v0.1/hls/audio-play?url=${encodeURIComponent(
              originalUrl,
            )}`;
            const response = await fetch(backendUrl, {
              headers: {
                'User-Agent': 'AudioApp/1.0',
                Accept:
                  'application/x-mpegURL, application/vnd.apple.mpegurl, application/json',
              },
            });

            if (!response.ok) {
              throw new Error(`Backend request failed: ${response.status}`);
            }

            const body = await response.json();
            let track: Track | null = null;

            if (
              body.source === 'hls' &&
              body.playlistUrl &&
              isValidUrl(body.playlistUrl)
            ) {
              // Create unique ID based on original URL and timestamp
              const urlHash = originalUrl
                .slice(-20)
                .replace(/[^a-zA-Z0-9]/g, '');
              const uniqueId = `hls-${Date.now()}-${urlHash}`;

              track = {
                id: uniqueId,
                url: body.playlistUrl,
                title: metadata?.title || body.title || 'HLS Stream',
                artist: metadata?.artist || body.artist || 'YouTube',
                artwork:
                  metadata?.artwork && isValidUrl(metadata.artwork)
                    ? metadata.artwork
                    : body.artwork && isValidUrl(body.artwork)
                    ? body.artwork
                    : 'https://avatars.githubusercontent.com/u/113108193?v=4',
                description: metadata?.description || body.description,
                source: 'hls',
                raw: { originalUrl, ...body }, // Store original URL for debugging
              };
            } else if (
              body.source === 'direct' &&
              body.audioStreamUrl &&
              isValidUrl(body.audioStreamUrl)
            ) {
              // Create unique ID based on original URL and timestamp
              const urlHash = originalUrl
                .slice(-20)
                .replace(/[^a-zA-Z0-9]/g, '');
              const uniqueId = `direct-${Date.now()}-${urlHash}`;

              track = {
                id: uniqueId,
                url: body.audioStreamUrl,
                title: metadata?.title || body.title || 'Direct stream',
                artist: metadata?.artist || body.artist || 'YouTube',
                artwork:
                  metadata?.artwork && isValidUrl(metadata.artwork)
                    ? metadata.artwork
                    : body.artwork && isValidUrl(body.artwork)
                    ? body.artwork
                    : 'https://avatars.githubusercontent.com/u/113108193?v=4',
                description: metadata?.description || body.description,
                source: 'direct',
                raw: { originalUrl, ...body }, // Store original URL for debugging
              };
            } else if (body.source === 'queued') {
              set({
                statusMsg: `Transcode queued (jobId=${body.jobId})`,
                loading: false,
              });
              return;
            }

            if (track && isValidTrack(track)) {
              if (addToQueue) {
                await get().addToQueue(track, true);
              } else {
                // CRITICAL FIX: When replacing queue, stop current playback first
                console.log('Replacing entire queue with new track...');

                // Stop current playback
                try {
                  await AudioPro.stop();
                  await new Promise(resolve => setTimeout(resolve, 100));
                } catch (stopError) {
                  console.warn(
                    'Error stopping before queue replacement:',
                    stopError,
                  );
                }

                // Clear current state
                set({
                  queue: [track],
                  currentIndex: 0,
                  isPlaying: false,
                  loading: true,
                  error: null,
                  statusMsg: 'Preparing new track...',
                });

                // Start playing the new track
                await get().playTrackNow(0);
              }
            } else {
              throw new Error('Generated track is invalid');
            }
          } catch (error: any) {
            console.error('playFromBackend error:', error);
            set({
              loading: false,
              error: error?.message || 'Failed to fetch from backend',
              statusMsg: 'Failed to load from backend',
            });
          }
        },

        // FIXED: Proper AudioPro event sync
        syncAudioProState: (event): void => {
          console.log('Syncing AudioPro event:', event);

          switch (event.type) {
            case 'STATE_CHANGED':
              const state = event.payload?.state;
              const isPlaying = state === 'PLAYING';
              const isLoading = state === 'LOADING' || state === 'BUFFERING';
              const isStopped = state === 'STOPPED' || state === 'ENDED';

              set({
                isPlaying,
                loading: isLoading,
                position: event.payload?.position || get().position,
                duration:
                  event.payload?.duration > 0
                    ? event.payload.duration
                    : get().duration,
                error: state === 'ERROR' ? 'Playback error' : null,
                statusMsg: isLoading
                  ? 'Loading...'
                  : isPlaying
                  ? 'Playing'
                  : isStopped
                  ? 'Stopped'
                  : state || '',
              });

              // Auto-advance on track end if repeat is off
              if (isStopped && !isLoading) {
                const currentState = get();
                if (currentState.repeat === 'one') {
                  // Replay current track
                  setTimeout(() => {
                    if (currentState.currentIndex >= 0) {
                      get().playTrackNow(currentState.currentIndex);
                    }
                  }, 100);
                } else if (
                  currentState.repeat === 'all' ||
                  currentState.currentIndex < currentState.queue.length - 1
                ) {
                  // Play next track
                  setTimeout(() => get().playNext(), 100);
                }
              }
              break;

            case 'TRACK_ENDED':
              // Handle track ending
              const currentState = get();
              if (currentState.repeat === 'one') {
                setTimeout(() => {
                  if (currentState.currentIndex >= 0) {
                    get().playTrackNow(currentState.currentIndex);
                  }
                }, 100);
              } else {
                setTimeout(() => get().playNext(), 100);
              }
              break;

            case 'SEEK_COMPLETE':
              set({
                position: event.payload?.position || get().position,
              });
              break;

            case 'PLAYBACK_READY':
            case 'TRACK_LOADED':
              // Track is ready to play
              set({
                loading: false,
                error: null,
                statusMsg: 'Ready',
                duration: event.payload?.duration || get().duration,
              });
              break;

            case 'PLAYBACK_STARTED':
              set({
                loading: false,
                isPlaying: true,
                error: null,
                statusMsg: 'Playing',
              });
              break;

            default:
              console.log('Unhandled AudioPro event:', event.type);
              break;
          }
        },

        // FIXED: Initialize AudioPro event listener using correct API
        initializeAudioProListener: (): void => {
          try {
            console.log('Initializing AudioPro event listener...');

            // Based on react-native-audio-pro v10.1.1 API
            // addEventListener takes a callback function as the only argument
            const subscription = AudioPro.addEventListener((event: any) => {
              console.log('AudioPro event received:', event);

              // The event structure from AudioPro typically includes:
              // { type: 'state-changed', state: 'playing', position: 1000, duration: 180000 }
              // { type: 'track-ended' }
              // { type: 'seek-complete', position: 5000 }

              switch (event.type) {
                case 'state-changed':
                  get().syncAudioProState({
                    type: 'STATE_CHANGED',
                    payload: {
                      state: event.state?.toUpperCase(), // Convert to uppercase for consistency
                      position: event.position,
                      duration: event.duration,
                    },
                  });
                  break;

                case 'track-ended':
                  get().syncAudioProState({
                    type: 'TRACK_ENDED',
                    payload: event,
                  });
                  break;

                case 'seek-complete':
                  get().syncAudioProState({
                    type: 'SEEK_COMPLETE',
                    payload: { position: event.position },
                  });
                  break;

                case 'track-loaded':
                case 'playback-ready':
                  get().syncAudioProState({
                    type: 'PLAYBACK_READY',
                    payload: { duration: event.duration },
                  });
                  break;

                default:
                  console.log('Unhandled AudioPro event type:', event.type);
                  break;
              }
            });

            console.log('AudioPro event listener registered successfully');

            // Store subscription for cleanup if needed
            // You could add this to the state if you need to unsubscribe later
          } catch (error) {
            console.error('Failed to initialize AudioPro listener:', error);

            // Fallback: Start manual polling if event listener fails
            console.log('Falling back to manual state polling...');
            get().startStatePolling();
          }
        },

        // Manual state polling as fallback
        startStatePolling: (): void => {
          const state = get();

          // Don't start multiple polling intervals
          if (state.pollingInterval) {
            return;
          }

          console.log('Starting manual AudioPro state polling...');

          const interval = setInterval(async () => {
            try {
              // Check if AudioPro has a getState or similar method
              let currentState = null;
              let currentPosition = 0;
              let currentDuration = 0;

              // Try to get current state from AudioPro
              if (typeof (AudioPro as any).getState === 'function') {
                currentState = await (AudioPro as any).getState();
              }

              if (typeof (AudioPro as any).getPosition === 'function') {
                currentPosition = await (AudioPro as any).getPosition();
              }

              if (typeof (AudioPro as any).getDuration === 'function') {
                currentDuration = await (AudioPro as any).getDuration();
              }

              // Update state based on what we found
              const playerState = get();

              if (currentState) {
                const isPlaying =
                  currentState === 'playing' || currentState === 'PLAYING';
                const isLoading =
                  currentState === 'loading' ||
                  currentState === 'LOADING' ||
                  currentState === 'buffering' ||
                  currentState === 'BUFFERING';

                // Only update if state actually changed to avoid unnecessary re-renders
                if (
                  playerState.isPlaying !== isPlaying ||
                  playerState.loading !== isLoading ||
                  Math.abs(playerState.position - currentPosition) > 1000
                ) {
                  // Only update if position changed significantly

                  set({
                    isPlaying,
                    loading: isLoading,
                    position: currentPosition || playerState.position,
                    duration:
                      currentDuration > 0
                        ? currentDuration
                        : playerState.duration,
                    error:
                      currentState === 'error' || currentState === 'ERROR'
                        ? 'Playback error'
                        : null,
                    statusMsg: isLoading
                      ? 'Loading...'
                      : isPlaying
                      ? 'Playing'
                      : 'Paused',
                  });
                }
              }
            } catch (error) {
              console.warn('State polling error:', error);
            }
          }, 1000); // Poll every second

          set({ pollingInterval: interval });
        },

        stopStatePolling: (): void => {
          const state = get();
          if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
            set({ pollingInterval: null });
            console.log('Stopped manual AudioPro state polling');
          }
        },
      }),
      {
        name: 'player-storage',
        version: 1,
        partialize: state => ({
          queue: (state?.queue || []).filter(track => isValidTrack(track)),
          currentIndex:
            typeof state?.currentIndex === 'number' ? state.currentIndex : -1,
          shuffle: state?.shuffle || false,
          repeat: state?.repeat || 'off',
        }),
        migrate: (persistedState: any) => ({
          ...initialState,
          ...persistedState,
          loading: false,
          error: null,
          playingTrack: null,
          statusMsg: '',
          position: 0,
          duration: 0,
          isPlaying: false,
          pollingInterval: null, // Never persist the interval
        }),
      },
    ),
    { name: 'player-store' },
  ),
);

// Helper to get current track directly from queue
export const useCurrentTrack = () => {
  const { queue, currentIndex } = usePlayerStore();
  return currentIndex >= 0 && queue[currentIndex] ? queue[currentIndex] : null;
};

export type { PlayerState };
