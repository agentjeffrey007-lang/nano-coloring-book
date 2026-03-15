import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PreviewScreen({ route, navigation }) {
  const { images = [], pages = [], prompt, bookId } = route.params;
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const currentImage = images[selectedImageIdx];

  return (
    <View style={styles.container}>
      {/* Main preview image */}
      <View style={styles.mainImageContainer}>
        {currentImage ? (
          <Image
            source={{ uri: currentImage }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}
        <Text style={styles.pageLabel}>
          Page {selectedImageIdx + 1} of {images.length}
        </Text>
      </View>

      {/* Thumbnail strip */}
      <View style={styles.thumbnailSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        >
          {images.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedImageIdx(idx)}
              style={[
                styles.thumbnail,
                selectedImageIdx === idx && styles.thumbnailActive,
              ]}
            >
              <Image source={{ uri: img }} style={styles.thumbnailImage} />
              <Text style={styles.thumbnailLabel}>{idx + 1}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Color palettes preview */}
      {pages[selectedImageIdx]?.colorVariants && (
        <View style={styles.palettePreview}>
          <Text style={styles.paletteSectionTitle}>Color Palettes Available</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {pages[selectedImageIdx].colorVariants.map((variant, idx) => (
              <View key={idx} style={styles.paletteChip}>
                <Text style={styles.paletteName}>{variant.name}</Text>
                <View style={styles.paletteColors}>
                  {variant.colors.slice(0, 4).map((color, ci) => (
                    <View
                      key={ci}
                      style={[styles.paletteDot, { backgroundColor: color }]}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Checkout', { images, pages, prompt, bookId })}
        >
          <Text style={styles.primaryButtonText}>💳 Order Printed Book</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>← Back to Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  mainImage: {
    width: SCREEN_WIDTH - 40,
    height: undefined,
    aspectRatio: 1,
    maxHeight: 360,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  pageLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    marginTop: 8,
  },
  placeholderContainer: {
    width: SCREEN_WIDTH - 40,
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  thumbnailSection: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  thumbnailList: {
    paddingHorizontal: 15,
  },
  thumbnail: {
    width: 64,
    height: 64,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    alignItems: 'center',
  },
  thumbnailActive: {
    borderColor: '#FF6B9D',
    borderWidth: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  thumbnailLabel: {
    position: 'absolute',
    bottom: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    borderRadius: 3,
    overflow: 'hidden',
  },
  palettePreview: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paletteSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paletteChip: {
    backgroundColor: '#f8f8fc',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  paletteName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  paletteColors: {
    flexDirection: 'row',
    gap: 4,
  },
  paletteDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#FF6B9D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
});
