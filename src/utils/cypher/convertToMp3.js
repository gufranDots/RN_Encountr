import {NativeModules, Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

const CONVERT_OPTIONS = {
  bitrate: 128,
  quality: 2,
};

const MIN_INPUT_BYTES = 1024;
const MIN_MP3_BYTES = 256;

const LINKING_ERROR =
  'MP3 converter is not available. Rebuild the Android app after installing native modules.';

const getNativeConverter = () => {
  const nativeModule = NativeModules.WavToMp3;
  if (!nativeModule?.convertWavToMp3) {
    throw new Error(LINKING_ERROR);
  }
  return nativeModule;
};

const stripFilePrefix = uri => (uri || '').replace(/^file:\/+/, '/');

const toFileUri = path => {
  if (!path) {
    return path;
  }
  if (path.startsWith('file://')) {
    return path;
  }
  return `file://${path}`;
};

const buildMp3OutputPath = () =>
  `${RNFetchBlob.fs.dirs.CacheDir}/cypher_upload_${Date.now()}.mp3`;

async function resolveRecordingPath(inputUri) {
  const candidates = new Set();
  const stripped = stripFilePrefix(inputUri);

  if (stripped) {
    candidates.add(stripped);
  }

  const fileName = stripped?.split('/').pop();
  if (fileName) {
    candidates.add(`${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`);
  }

  for (const candidate of candidates) {
    if (await RNFetchBlob.fs.exists(candidate)) {
      const stat = await RNFetchBlob.fs.stat(candidate);
      if (stat.size >= MIN_INPUT_BYTES) {
        return candidate;
      }
    }
  }

  throw new Error('Recording file not found or too short. Please try again.');
}

async function prepareAndroidInputPath(inputPath) {
  const lowerPath = inputPath.toLowerCase();

  if (lowerPath.endsWith('.aac')) {
    return inputPath;
  }

  if (lowerPath.endsWith('.m4a') || lowerPath.endsWith('.mp4')) {
    const aacPath = inputPath.replace(/\.(m4a|mp4)$/i, '.aac');
    try {
      await RNFetchBlob.fs.unlink(aacPath);
    } catch (e) {
      // ignore
    }
    await RNFetchBlob.fs.cp(inputPath, aacPath);
    return aacPath;
  }

  return inputPath;
}

async function assertValidMp3(outputPath) {
  const exists = await RNFetchBlob.fs.exists(outputPath);
  if (!exists) {
    throw new Error('MP3 conversion failed');
  }

  const stat = await RNFetchBlob.fs.stat(outputPath);
  if (stat.size < MIN_MP3_BYTES) {
    throw new Error('Converted MP3 file is invalid. Please record again.');
  }
}

export async function convertRecordingToMp3(inputUri) {
  if (!inputUri) {
    throw new Error('No recording path to convert');
  }

  const nativeModule = getNativeConverter();

  if (Platform.OS === 'ios') {
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  let inputPath = await resolveRecordingPath(inputUri);

  if (Platform.OS === 'android') {
    inputPath = await prepareAndroidInputPath(inputPath);
  }

  const outputPath = buildMp3OutputPath();
  const inputFileUri = toFileUri(inputPath);
  const outputFileUri = toFileUri(outputPath);

  try {
    await RNFetchBlob.fs.unlink(outputPath);
  } catch (e) {
    // ignore if missing
  }

  try {
    let resultPath;
    if (Platform.OS === 'android') {
      if (!nativeModule.convertAacToMp3) {
        throw new Error(LINKING_ERROR);
      }
      resultPath = await nativeModule.convertAacToMp3(
        inputFileUri,
        outputFileUri,
        CONVERT_OPTIONS,
      );
    } else {
      resultPath = await nativeModule.convertWavToMp3(
        inputFileUri,
        outputFileUri,
        CONVERT_OPTIONS,
      );
    }

    const finalPath = stripFilePrefix(resultPath || outputPath);
    await assertValidMp3(finalPath);
    return toFileUri(finalPath);
  } catch (err) {
    const message =
      err?.message ||
      err?.userInfo?.WAV_ERROR ||
      'Failed to convert recording to MP3';
    throw new Error(message);
  }
}
