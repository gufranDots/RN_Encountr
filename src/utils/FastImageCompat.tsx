import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { NitroImage, NativeNitroImage, useImage } from 'react-native-nitro-image';
import { WebImages } from 'react-native-nitro-web-image';

type FastImagePriority = 'low' | 'normal' | 'high';
type FastImageCacheControl = 'immutable' | 'web' | 'cacheOnly';
type FastImageResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

type FastImageSourceObject = {
  uri?: string;
  priority?: FastImagePriority;
  cache?: FastImageCacheControl;
};

type FastImageSource = FastImageSourceObject | number;

type FastImageProps = {
  source?: any;
  style?: any;
  resizeMode?: FastImageResizeMode;
  children?: React.ReactNode;
  onLoadStart?: () => void;
  onLoad?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: unknown) => void;
  [key: string]: any;
};

const priority = {
  low: 'low' as const,
  normal: 'default' as const,
  high: 'high' as const,
};

const cacheControl = {
  immutable: 'immutable' as const,
  web: 'web' as const,
  cacheOnly: 'cacheOnly' as const,
};

const resizeMode = {
  contain: 'contain' as const,
  cover: 'cover' as const,
  stretch: 'stretch' as const,
  center: 'center' as const,
};

function toNitroSource(source?: any): any {
  if (source == null) return undefined;

  if (typeof source === 'number') return source;

  if (Array.isArray(source)) {
    const first = source[0];
    if (typeof first === 'number') return first;
    if (first != null && typeof first === 'object' && 'uri' in first && typeof first.uri === 'string') {
      if (Platform.OS === 'android') {
        if (first.uri.startsWith('file://') || first.uri.startsWith('content://') || first.uri.startsWith('data:')) {
          return { url: first.uri };
        }
        if (first.uri.startsWith('/')) {
          return { url: `file://${first.uri}` };
        }
      } else {
        if (first.uri.startsWith('file://')) {
          return { filePath: first.uri.replace('file://', '') };
        }
        if (first.uri.startsWith('/')) {
          return { filePath: first.uri };
        }
      }
      return { url: first.uri };
    }
    return undefined;
  }

  if (typeof source === 'object' && 'uri' in source) {
    if (typeof source.uri !== 'string' || source.uri.trim() === '') {
      return undefined;
    }
    const sourceWithMeta = source as FastImageSourceObject;
    
    if (Platform.OS === 'android') {
      if (sourceWithMeta.uri!.startsWith('file://') || sourceWithMeta.uri!.startsWith('content://') || sourceWithMeta.uri!.startsWith('data:')) {
        return { url: sourceWithMeta.uri! };
      }
      if (sourceWithMeta.uri!.startsWith('/')) {
        return { url: `file://${sourceWithMeta.uri!}` };
      }
    } else {
      if (sourceWithMeta.uri!.startsWith('file://')) {
        return { filePath: sourceWithMeta.uri!.replace('file://', '') };
      }
      if (sourceWithMeta.uri!.startsWith('/')) {
        return { filePath: sourceWithMeta.uri! };
      }
    }

    const result: any = {
      url: sourceWithMeta.uri!,
    };
    
    // Only add options if really needed to prevent variant null cast issues
    if (sourceWithMeta.priority || sourceWithMeta.cache === cacheControl.web) {
      result.options = {};
      if (sourceWithMeta.priority) {
        result.options.priority = priority[sourceWithMeta.priority];
      }
      if (sourceWithMeta.cache === cacheControl.web) {
        result.options.forceRefresh = true;
      }
    }
    
    return result;
  }

  // Prevent sending an object that Nitro doesn't recognize (like {} or {uri: null})
  if (typeof source === 'object' && Object.keys(source).length === 0) {
    return undefined;
  }

  return source;
}

function getSourceKey(source?: any): string {
  if (typeof source === 'number') return String(source);

  if (Array.isArray(source)) {
    const first = source[0];
    if (typeof first === 'number') return String(first);
    if (first != null && typeof first === 'object' && 'uri' in first && typeof first.uri === 'string') {
      return first.uri;
    }
    return '';
  }

  if (source != null && typeof source === 'object' && 'uri' in source && typeof source.uri === 'string') {
    return source.uri;
  }

  return '';
}

function TrackedNitroImage({
  source,
  imageKey,
  style,
  resolvedResizeMode,
  onLoadStart,
  onLoad,
  onLoadEnd,
  onError,
  children,
  rest,
}: any) {
  const { image, error } = useImage(source);
  const startedRef = useRef<string>('');
  const endedRef = useRef<string>('');

  useEffect(() => {
    if (startedRef.current === imageKey) return;
    startedRef.current = imageKey;
    endedRef.current = '';
    onLoadStart?.();
  }, [imageKey, onLoadStart]);

  useEffect(() => {
    if (!image || endedRef.current === imageKey) return;
    endedRef.current = imageKey;
    onLoad?.();
    onLoadEnd?.();
  }, [image, imageKey, onLoad, onLoadEnd]);

  useEffect(() => {
    if (!error || endedRef.current === imageKey) return;
    endedRef.current = imageKey;
    onError?.(error);
    onLoadEnd?.();
  }, [error, imageKey, onError, onLoadEnd]);

  const flatStyle = StyleSheet.flatten(style) ?? {};
  const { tintColor, ...viewStyle } = flatStyle;

  return (
    <View style={[viewStyle, { overflow: 'hidden' }]}>
      <NativeNitroImage image={image} resizeMode={resolvedResizeMode} style={StyleSheet.absoluteFillObject} tintColor={tintColor} {...rest} />
      {children}
    </View>
  );
}

function PlainNitroImage({ source, style, resolvedResizeMode, children, rest }: any) {
  const flatStyle = StyleSheet.flatten(style) ?? {};
  const { tintColor, ...viewStyle } = flatStyle;

  return (
    <View style={[viewStyle, { overflow: 'hidden' }]}>
      <NitroImage image={source} resizeMode={resolvedResizeMode} style={StyleSheet.absoluteFillObject} tintColor={tintColor} {...rest} />
      {children}
    </View>
  );
}

const FastImageCompat = React.forwardRef<unknown, FastImageProps>(function FastImageCompat(
  props: FastImageProps,
  _ref,
) {
  const {
    source,
    style,
    resizeMode: propResizeMode,
    children,
    onLoadStart,
    onLoad,
    onLoadEnd,
    onError,
    ...rest
  } = props;

  const nitroSource = useMemo(() => toNitroSource(source), [source]);
  const resolvedResizeMode = (propResizeMode as FastImageResizeMode | undefined) ?? resizeMode.cover;

  if (!nitroSource) {
    return null;
  }

  const shouldTrackState = Boolean(onLoadStart || onLoad || onLoadEnd || onError);
  const imageKey = `${getSourceKey(source)}:${String(resolvedResizeMode)}`;

  if (shouldTrackState) {
    return (
      <TrackedNitroImage
        source={nitroSource}
        imageKey={imageKey}
        style={style}
        resolvedResizeMode={resolvedResizeMode}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onLoadEnd={onLoadEnd}
        onError={onError}
        children={children}
        rest={rest}
      />
    );
  }

  return (
    <PlainNitroImage
      source={nitroSource}
      style={style}
      resolvedResizeMode={resolvedResizeMode}
      children={children}
      rest={rest}
    />
  );
});

FastImageCompat.displayName = 'FastImageCompat';

(FastImageCompat as any).preload = (sources: Array<FastImageSource>) => {
  sources.forEach(item => {
    if (item != null && typeof item === 'object' && 'uri' in item && typeof item.uri === 'string' && item.uri.trim() !== '') {
      try {
        WebImages.preload(item.uri);
      } catch (e) {
        console.warn('FastImage preloading failed', e);
      }
    }
  });
};

(FastImageCompat as any).priority = priority;
(FastImageCompat as any).cacheControl = cacheControl;
(FastImageCompat as any).resizeMode = resizeMode;
(FastImageCompat as any).clearMemoryCache = async () => {};
(FastImageCompat as any).clearDiskCache = async () => {};

export default FastImageCompat as any;
