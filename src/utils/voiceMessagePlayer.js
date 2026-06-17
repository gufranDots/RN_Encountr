import {NativeModules, Platform} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import SoundPlayer from 'react-native-sound-player';
import RNFetchBlob from 'rn-fetch-blob';

const BACKEND = {
  AUDIO_RECORDER: 'audioRecorder',
  SOUND_PLAYER: 'soundPlayer',
};

const isRemoteUrl = url => /^https?:\/\//i.test(url);

const getFileExtension = url => {
  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() || 'm4a';
};

const getMimeType = ext => {
  switch (ext) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'aac':
      return 'audio/aac';
    case 'mp4':
      return 'audio/mp4';
    default:
      return 'audio/m4a';
  }
};

const toUserFriendlyError = err => {
  const msg = String(err?.message || '');
  if (
    msg.includes('Prepare failed') ||
    msg.includes('MediaPlayer') ||
    msg.includes('timed out') ||
    msg.includes('Download failed') ||
    msg.includes('empty') ||
    msg.includes('CONVERSION_ERROR') ||
    msg.includes('ALAC')
  ) {
    return new Error(
      'This voice message format is not supported on Android. Ask the user to re-record their voice intro.',
    );
  }
  return err instanceof Error ? err : new Error(msg || 'Unable to play voice message');
};

const resetPlayerState = player => {
  if (!player) {
    return;
  }
  player._isPlaying = false;
  player._hasPaused = false;
};

const clearSoundPlayerSubs = player => {
  const subs = player?._soundPlayerSubs;
  if (!subs) {
    return;
  }
  if (subs.playbackInterval) {
    clearInterval(subs.playbackInterval);
    subs.playbackInterval = null;
  }
  subs.finishedSub?.remove?.();
  subs.finishedSub = null;
  subs.playbackCallback = null;
};

const restoreAudioRecorderBackend = player => {
  player._backend = BACKEND.AUDIO_RECORDER;
  if (player._originalStartPlayer) {
    player.startPlayer = player._originalStartPlayer;
  }
  if (player._originalStopPlayer) {
    player.stopPlayer = player._originalStopPlayer;
  }
  if (player._originalAddPlayBackListener) {
    player.addPlayBackListener = player._originalAddPlayBackListener;
  }
  if (player._originalRemovePlayBackListener) {
    player.removePlayBackListener = player._originalRemovePlayBackListener;
  }
};

const attachSoundPlayerBackend = player => {
  if (!player._originalStartPlayer) {
    player._originalStartPlayer = player.startPlayer.bind(player);
    player._originalStopPlayer = player.stopPlayer.bind(player);
    player._originalAddPlayBackListener =
      player.addPlayBackListener.bind(player);
    player._originalRemovePlayBackListener =
      player.removePlayBackListener.bind(player);
  }

  player._backend = BACKEND.SOUND_PLAYER;
  player._soundPlayerSubs = player._soundPlayerSubs || {};

  player.removePlayBackListener = () => {
    clearSoundPlayerSubs(player);
  };

  player.addPlayBackListener = callback => {
    clearSoundPlayerSubs(player);
    player._soundPlayerSubs.playbackCallback = callback;
    player._soundPlayerSubs.playbackInterval = setInterval(async () => {
      try {
        const info = await SoundPlayer.getInfo();
        if (info && player._soundPlayerSubs.playbackCallback) {
          player._soundPlayerSubs.playbackCallback({
            duration: Math.round((info.duration || 0) * 1000),
            currentPosition: Math.round((info.currentTime || 0) * 1000),
            isFinished: false,
          });
        }
      } catch (e) {}
    }, 400);

    player._soundPlayerSubs.finishedSub = SoundPlayer.addEventListener(
      'FinishedPlaying',
      async () => {
        try {
          const info = await SoundPlayer.getInfo();
          player._soundPlayerSubs.playbackCallback?.({
            duration: Math.round((info?.duration || 0) * 1000),
            currentPosition: Math.round((info?.duration || 0) * 1000),
            isFinished: true,
          });
        } catch (e) {}
      },
    );
  };

  player.stopPlayer = async () => {
    clearSoundPlayerSubs(player);
    try {
      SoundPlayer.pause();
      SoundPlayer.stop();
    } catch (e) {}
    resetPlayerState(player);
  };

  player.startPlayer = async uri => startWithSoundPlayer(uri, {localFile: true});
};

const startWithSoundPlayer = (url, {localFile = false} = {}) =>
  new Promise((resolve, reject) => {
    if (Platform.OS === 'android' && isRemoteUrl(url)) {
      reject(new Error('Remote URL playback is not supported with SoundPlayer on Android'));
      return;
    }

    let loadingSub = null;
    let loadingUrlSub = null;
    let errorSub = null;
    let timeoutId = null;
    let settled = false;

    const cleanup = () => {
      loadingSub?.remove?.();
      loadingUrlSub?.remove?.();
      errorSub?.remove?.();
      loadingSub = null;
      loadingUrlSub = null;
      errorSub = null;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(url);
    };

    const fail = err => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(err);
    };

    timeoutId = setTimeout(() => {
      fail(new Error('Voice message playback timed out'));
    }, 20000);

    errorSub = SoundPlayer.addEventListener('OnSetupError', data => {
      fail(new Error(data?.error || 'Unable to play voice message'));
    });

    loadingUrlSub = SoundPlayer.addEventListener('FinishedLoadingURL', ({success}) => {
      if (success === false) {
        fail(new Error('Unable to play voice message'));
        return;
      }
      try {
        SoundPlayer.play();
        finish();
      } catch (err) {
        fail(err);
      }
    });

    loadingSub = SoundPlayer.addEventListener('FinishedLoading', ({success}) => {
      if (success === false) {
        fail(new Error('Unable to play voice message'));
        return;
      }
      if (localFile) {
        finish();
        return;
      }
      try {
        SoundPlayer.play();
        finish();
      } catch (err) {
        fail(err);
      }
    });

    try {
      SoundPlayer.stop();
      if (localFile) {
        SoundPlayer.playUrl(url);
      } else {
        SoundPlayer.loadUrl(url);
      }
    } catch (err) {
      fail(err);
    }
  });

export const createVoicePlayer = () => {
  const player = new AudioRecorderPlayer();
  player._backend = BACKEND.AUDIO_RECORDER;
  player._activeBackend = null;
  player._originalStartPlayer = player.startPlayer.bind(player);
  player._originalStopPlayer = player.stopPlayer.bind(player);
  player._originalAddPlayBackListener =
    player.addPlayBackListener.bind(player);
  player._originalRemovePlayBackListener =
    player.removePlayBackListener.bind(player);
  return player;
};

export const stopVoiceMessage = async player => {
  if (!player) {
    return;
  }
  resetPlayerState(player);
  player._activeBackend = null;
  clearSoundPlayerSubs(player);

  try {
    SoundPlayer.pause();
    SoundPlayer.stop();
  } catch (e) {}

  try {
    player._isPlaying = false;
    player._hasPaused = false;
    await NativeModules.RNAudioRecorderPlayer?.stopPlayer?.();
  } catch (e) {}

  try {
    if (player._originalRemovePlayBackListener) {
      player._originalRemovePlayBackListener();
    } else {
      player.removePlayBackListener();
    }
  } catch (e) {}
};

const ensureCachedFileReadable = async localPath => {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    await RNFetchBlob.fs.scanFile([
      {path: localPath, mime: getMimeType(getFileExtension(localPath))},
    ]);
  } catch (e) {
    console.warn('Voice message cache scan failed:', e?.message || e);
  }
};

const getLocalUriVariants = localPath => {
  const normalizedPath = localPath.replace(/^file:\/\//, '');
  const variants = [
    `file://${normalizedPath}`,
    normalizedPath.startsWith('/') ? `file://${normalizedPath}` : `file:///${normalizedPath}`,
    normalizedPath,
  ];
  return [...new Set(variants)];
};

const downloadVoiceToCache = async url => {
  const ext = getFileExtension(url);
  const cachePath = `${RNFetchBlob.fs.dirs.CacheDir}/voice_${Date.now()}.${ext}`;
  const response = await RNFetchBlob.config({
    path: cachePath,
    fileCache: true,
    trusty: true,
  }).fetch('GET', url);

  const status = response.info().status;
  if (status < 200 || status >= 300) {
    throw new Error(`Download failed with status ${status}`);
  }

  const localPath = response.path();
  const stat = await RNFetchBlob.fs.stat(localPath);
  if (!stat?.size || stat.size < 64) {
    throw new Error('Downloaded voice file is empty');
  }

  await ensureCachedFileReadable(localPath);
  return localPath;
};

const convertCachedVoiceToMp3 = async localPath => {
  const nativeModule = NativeModules.WavToMp3;
  if (!nativeModule?.convertAacToMp3 || Platform.OS !== 'android') {
    return null;
  }

  const inputPath = localPath.replace(/^file:\/\//, '');
  const lowerPath = inputPath.toLowerCase();
  if (!lowerPath.endsWith('.m4a') && !lowerPath.endsWith('.aac') && !lowerPath.endsWith('.mp4')) {
    return null;
  }

  const aacPath = inputPath.replace(/\.(m4a|mp4)$/i, '.aac');
  const mp3Path = `${RNFetchBlob.fs.dirs.CacheDir}/voice_playback_${Date.now()}.mp3`;

  try {
    if (aacPath !== inputPath) {
      await RNFetchBlob.fs.unlink(aacPath).catch(() => {});
      await RNFetchBlob.fs.cp(inputPath, aacPath);
    }

    await RNFetchBlob.fs.unlink(mp3Path).catch(() => {});

    const resultPath = await nativeModule.convertAacToMp3(
      `file://${aacPath}`,
      `file://${mp3Path}`,
      {bitrate: 128, quality: 2},
    );

    const finalPath = String(resultPath || mp3Path).replace(/^file:\/\//, '');
    const mp3Stat = await RNFetchBlob.fs.stat(finalPath);
    if (!mp3Stat?.size || mp3Stat.size < 256) {
      return null;
    }

    return finalPath;
  } catch (e) {
    console.warn('Voice message MP3 conversion failed:', e?.message || e);
    return null;
  }
};

const buildAndroidPlaybackAttempts = async url => {
  const attempts = [];

  if (isRemoteUrl(url)) {
    let localPath = null;
    try {
      localPath = await downloadVoiceToCache(url);
    } catch (e) {
      console.warn('Voice message cache download failed:', e?.message || e);
    }

    if (localPath) {
      const mp3Path = await convertCachedVoiceToMp3(localPath);
      if (mp3Path) {
        getLocalUriVariants(mp3Path).forEach(uri => {
          attempts.push({uri, backend: BACKEND.AUDIO_RECORDER});
          attempts.push({uri, backend: BACKEND.SOUND_PLAYER, localFile: true});
        });
      }

      getLocalUriVariants(localPath).forEach(uri => {
        attempts.push({uri, backend: BACKEND.AUDIO_RECORDER});
        attempts.push({uri, backend: BACKEND.SOUND_PLAYER, localFile: true});
      });
    }

    attempts.push({uri: url, backend: BACKEND.AUDIO_RECORDER, httpHeaders: {}});
    return attempts;
  }

  if (url.startsWith('file://')) {
    const localPath = url.replace(/^file:\/\//, '');
    getLocalUriVariants(localPath).forEach(uri => {
      attempts.push({uri, backend: BACKEND.AUDIO_RECORDER});
      attempts.push({uri, backend: BACKEND.SOUND_PLAYER, localFile: true});
    });
    return attempts;
  }

  getLocalUriVariants(url).forEach(uri => {
    attempts.push({uri, backend: BACKEND.AUDIO_RECORDER});
    attempts.push({uri, backend: BACKEND.SOUND_PLAYER, localFile: true});
  });
  return attempts;
};

const tryAudioRecorderPlayback = async (player, attempt) => {
  restoreAudioRecorderBackend(player);
  const result = await player.startPlayer(attempt.uri, attempt.httpHeaders);
  player._activeBackend = BACKEND.AUDIO_RECORDER;
  return result;
};

const trySoundPlayerPlayback = async (player, attempt) => {
  attachSoundPlayerBackend(player);
  const result = await startWithSoundPlayer(attempt.uri, {
    localFile: attempt.localFile,
  });
  player._isPlaying = true;
  player._activeBackend = BACKEND.SOUND_PLAYER;
  return result;
};

export const startVoiceMessage = async (player, url) => {
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';
  if (!trimmedUrl) {
    throw new Error('No voice message URL');
  }

  await stopVoiceMessage(player);

  const attempts =
    Platform.OS === 'android'
      ? await buildAndroidPlaybackAttempts(trimmedUrl)
      : [{uri: trimmedUrl, backend: BACKEND.AUDIO_RECORDER}];

  let lastError = null;

  for (const attempt of attempts) {
    try {
      await stopVoiceMessage(player);
      if (attempt.backend === BACKEND.SOUND_PLAYER) {
        return await trySoundPlayerPlayback(player, attempt);
      }
      return await tryAudioRecorderPlayback(player, attempt);
    } catch (err) {
      lastError = err;
      resetPlayerState(player);
      try {
        await stopVoiceMessage(player);
      } catch (e) {}
    }
  }

  throw toUserFriendlyError(
    lastError || new Error('Unable to play voice message'),
  );
};

export const resetVoicePlayer = playerRef => {
  if (playerRef?.current) {
    stopVoiceMessage(playerRef.current);
  }
  const player = createVoicePlayer();
  if (playerRef) {
    playerRef.current = player;
  }
  return player;
};
