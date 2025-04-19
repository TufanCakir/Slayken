// components/FastImageWrapper.js

import React, { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

/**
 * FastImageWrapper
 * - Zeigt Ladeanzeige & Fallback bei Fehler
 * - Unterstützt Styles & Events
 * - Memoized für Performance
 */
const FastImageWrapper = memo(
  ({
    source,
    containerStyle,
    imageStyle,
    contentFit = 'contain',
    cachePolicy = 'memory-disk',
    transition = 300,
    fallbackSource,
    placeholderColor = '#eee',
    onError,
    onLoad,
    onLoadStart,
    onLoadEnd,
    ...rest
  }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleError = useCallback(
      event => {
        setError(true);
        setLoading(false);
        if (__DEV__) {
          console.warn('FastImageWrapper error:', event?.nativeEvent?.error || event);
        }
        onError?.(event);
      },
      [onError],
    );

    const handleLoadStart = useCallback(
      event => {
        setLoading(true);
        onLoadStart?.(event);
      },
      [onLoadStart],
    );

    const handleLoadEnd = useCallback(
      event => {
        setLoading(false);
        onLoadEnd?.(event);
        onLoad?.(event);
      },
      [onLoad, onLoadEnd],
    );

    const resolvedSource = useMemo(
      () => (typeof source === 'string' ? { uri: source } : source),
      [source],
    );

    const imageProps = {
      style: [styles.image, imageStyle],
      contentFit,
      cachePolicy,
      transition,
      ...rest,
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {loading && (
          <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
            <ActivityIndicator style={styles.indicator} />
          </View>
        )}

        {!error && (
          <Image
            source={resolvedSource}
            onError={handleError}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            {...imageProps}
          />
        )}

        {error && fallbackSource && <Image source={fallbackSource} {...imageProps} />}
      </View>
    );
  },
);

FastImageWrapper.displayName = 'FastImageWrapper';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    flex: 1,
  },
});

export default FastImageWrapper;
