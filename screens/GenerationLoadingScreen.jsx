import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { generatePixelatedPlaceholder } from '../utils/nanoBananaAPI';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * GenerationLoadingScreen
 * 
 * Shows a pixelated loading animation as images are being generated.
 * - Displays pixelated placeholder for first image
 * - Animated swipe from top to bottom as generation progresses
 * - Once all images generated, first image comes to life
 * - Then transitions to preview with full book
 */
export default function GenerationLoadingScreen({
  currentPage,
  totalPages,
  firstImage,
  allImagesGenerated,
  isFirstImageReady,
}) {
  const swipeAnim = useRef(new Animated.Value(0)).start();
  const opacityAnim = useRef(new Animated.Value(0)).start();

  // Animate swipe when generation progresses
  useEffect(() => {
    const progress = currentPage / totalPages;
    
    Animated.timing(swipeAnim.current, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentPage, totalPages]);

  // Animate first image coming to life when done
  useEffect(() => {
    if (allImagesGenerated && isFirstImageReady) {
      Animated.timing(opacityAnim.current, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [allImagesGenerated, isFirstImageReady]);

  const pixelatedPlaceholder = generatePixelatedPlaceholder(currentPage, totalPages);
  const swipeHeight = swipeAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_HEIGHT * 0.5],
  });

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background}>
        <Image
          source={{ uri: pixelatedPlaceholder }}
          style={styles.pixelatedImage}
        />
      </View>

      {/* Swipe animation overlay */}
      {!allImagesGenerated && (
        <Animated.View
          style={[
            styles.swipeOverlay,
            {
              height: swipeHeight,
              backgroundColor: 'rgba(255, 107, 157, 0.6)',
            },
          ]}
        >
          <Text style={styles.swipeText}>Creating</Text>
        </Animated.View>
      )}

      {/* First image reveal (when done) */}
      {allImagesGenerated && firstImage && (
        <Animated.Image
          source={{ uri: firstImage }}
          style={[
            styles.firstImageReady,
            {
              opacity: opacityAnim.current,
            },
          ]}
          resizeMode="contain"
        />
      )}

      {/* Loading info */}
      <View style={styles.infoContainer}>
        <Text style={styles.titleText}>Creating Your Book</Text>
        <Text style={styles.progressText}>
          {currentPage} of {totalPages} pages
        </Text>
        
        {!allImagesGenerated ? (
          <>
            <ActivityIndicator
              size="large"
              color="#FF6B9D"
              style={styles.spinner}
            />
            <Text style={styles.statusText}>Drawing your coloring pages...</Text>
          </>
        ) : (
          <>
            <Text style={styles.completeText}>✨ All pages generated!</Text>
            <Text style={styles.readyText}>Preparing preview...</Text>
          </>
        )}
      </View>

      {/* Loading bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: swipeAnim.current.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelatedImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  swipeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  firstImageReady: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.45,
    borderRadius: 12,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
  },
  spinner: {
    marginVertical: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
  },
  completeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27AE60',
    marginVertical: 10,
  },
  readyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 2,
  },
});
