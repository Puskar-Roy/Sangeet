
import {
  AudioPro,
  AudioProContentType,
  AudioProEventType,
} from 'react-native-audio-pro';


export function setupAudio() {
  try {
    AudioPro.configure({
      contentType: AudioProContentType.MUSIC,
      debug: __DEV__,
      progressIntervalMs: 1000, 
      showNextPrevControls: false,
    });
  } catch (e) {

    console.warn('AudioPro.configure failed:', e);
  }


  AudioPro.addEventListener(event => {
    switch (event.type) {
      case AudioProEventType.REMOTE_PLAY:
        AudioPro.resume();
        break;
      case AudioProEventType.REMOTE_PAUSE:
        AudioPro.pause();
        break;
      case AudioProEventType.REMOTE_STOP:
        AudioPro.stop();
        break;
      case AudioProEventType.TRACK_ENDED:
     
        break;
      case AudioProEventType.PLAYBACK_ERROR:
        console.warn('AudioPro playback error:', event.payload);
        break;
      default:
        // other events: PROGRESS, BUFFERING, METADATA etc.
        break;
    }
  });
}
