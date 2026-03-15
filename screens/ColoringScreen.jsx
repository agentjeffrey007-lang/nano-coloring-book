import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PanResponder,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateBook } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH - 40;

export default function ColoringScreen({ route, navigation }) {
  const { book } = route.params;
  const pages = book.pages || book.images.map((img) => ({ image: img, colorVariants: [] }));
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#FF6B9D');
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState(0);
  const [brushSize, setBrushSize] = useState(8);
  const [strokes, setStrokes] = useState({}); // per-page strokes: { [pageIdx]: [{ points, color, size }] }
  const [currentStroke, setCurrentStroke] = useState(null);

  // Use refs to capture current values in PanResponder
  const colorRef = useRef(selectedColor);
  const brushSizeRef = useRef(brushSize);
  const pageIdxRef = useRef(currentPageIdx);
  const strokeRef = useRef(null);

  // Keep refs in sync with state
  React.useEffect(() => {
    colorRef.current = selectedColor;
  }, [selectedColor]);

  React.useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  React.useEffect(() => {
    pageIdxRef.current = currentPageIdx;
  }, [currentPageIdx]);

  React.useEffect(() => {
    strokeRef.current = currentStroke;
  }, [currentStroke]);

  const currentPage = pages[currentPageIdx];
  const currentImage = currentPage?.image || (book.images && book.images[currentPageIdx]);
  const currentVariants = currentPage?.colorVariants || [];
  const selectedPalette = currentVariants[selectedPaletteIdx];
  const colors = selectedPalette?.colors || [
    '#FF6B9D', '#FFD700', '#00CED1', '#32CD32', '#FF8C00', '#8B00FF',
    '#FF4757', '#2ED573', '#1E90FF', '#FFA502',
  ];

  const pageStrokes = strokes[currentPageIdx] || [];
  const [saving, setSaving] = useState(false);

  // Save strokes progress to AsyncStorage
  const saveProgress = useCallback(async () => {
    if (!book.id) return;
    try {
      setSaving(true);
      // Save strokes and palette state per book
      const coloringState = {
        bookId: book.id,
        strokes,
        currentPageIdx,
        selectedPaletteIdx,
        lastEdited: new Date().toISOString(),
      };
      await AsyncStorage.setItem(`coloring_${book.id}`, JSON.stringify(coloringState));
      
      // Update book's editing status
      await updateBook(book.id, {
        coloredPages: Object.keys(strokes).filter(k => strokes[k].length > 0).length,
        lastEdited: new Date().toISOString(),
      }).catch(err => console.warn('Could not update book:', err));
      
      setSaving(false);
      Alert.alert('Saved!', 'Your coloring progress has been saved.');
    } catch (error) {
      console.error('Error saving progress:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    }
  }, [book.id, strokes, currentPageIdx, selectedPaletteIdx]);

  // Auto-save when leaving the screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (Object.keys(strokes).length > 0) {
        saveProgress();
      }
    });
    return unsubscribe;
  }, [navigation, saveProgress, strokes]);

  // PanResponder for drawing - now reads from refs instead of closure
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newStroke = {
          points: [{ x: locationX, y: locationY }],
          color: colorRef.current,
          size: brushSizeRef.current,
        };
        strokeRef.current = newStroke;
        setCurrentStroke(newStroke);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (strokeRef.current) {
          const updatedStroke = {
            ...strokeRef.current,
            points: [...strokeRef.current.points, { x: locationX, y: locationY }],
          };
          strokeRef.current = updatedStroke;
          setCurrentStroke(updatedStroke);
        }
      },
      onPanResponderRelease: () => {
        if (strokeRef.current) {
          setStrokes((prev) => ({
            ...prev,
            [pageIdxRef.current]: [...(prev[pageIdxRef.current] || []), strokeRef.current],
          }));
          strokeRef.current = null;
          setCurrentStroke(null);
        }
      },
    })
  ).current;

  const handleUndo = () => {
    setStrokes((prev) => {
      const pageArr = prev[currentPageIdx] || [];
      if (pageArr.length === 0) return prev;
      return {
        ...prev,
        [currentPageIdx]: pageArr.slice(0, -1),
      };
    });
  };

  const handleClearPage = () => {
    setStrokes((prev) => ({
      ...prev,
      [currentPageIdx]: [],
    }));
  };

  const renderStrokes = (strokeList) => {
    // We render strokes as colored dots/lines using absolute positioned views
    // This is a simplified canvas - for production, use react-native-svg or react-native-canvas
    return strokeList.map((stroke, si) =>
      stroke.points.map((point, pi) => (
        <View
          key={`${si}-${pi}`}
          style={{
            position: 'absolute',
            left: point.x - stroke.size / 2,
            top: point.y - stroke.size / 2,
            width: stroke.size,
            height: stroke.size,
            borderRadius: stroke.size / 2,
            backgroundColor: stroke.color,
            opacity: 0.7,
          }}
        />
      ))
    );
  };

  return (
    <View style={styles.container}>
      {/* Canvas area */}
      <View style={styles.canvasWrapper}>
        <View style={styles.canvasContainer} {...panResponder.panHandlers}>
          <Image
            source={{ uri: currentImage }}
            style={styles.canvasImage}
            resizeMode="contain"
          />
          {/* Rendered strokes */}
          {renderStrokes(pageStrokes)}
          {currentStroke && renderStrokes([currentStroke])}
        </View>
      </View>

      {/* Palette selector */}
      {currentVariants.length > 0 && (
        <View style={styles.paletteSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentVariants.map((variant, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.paletteTab,
                  selectedPaletteIdx === idx && styles.paletteTabActive,
                ]}
                onPress={() => {
                  setSelectedPaletteIdx(idx);
                  setSelectedColor(variant.colors[0]);
                }}
              >
                <Text
                  style={[
                    styles.paletteTabText,
                    selectedPaletteIdx === idx && styles.paletteTabTextActive,
                  ]}
                >
                  {variant.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Color picker */}
      <View style={styles.colorSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.colorCircleSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Brush size */}
      <View style={styles.brushRow}>
        {[4, 8, 14, 22].map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.brushOption, brushSize === size && styles.brushOptionActive]}
            onPress={() => setBrushSize(size)}
          >
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: selectedColor,
              }}
            />
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.toolButton} onPress={handleUndo}>
          <Text style={styles.toolButtonText}>↩️ Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={handleClearPage}>
          <Text style={styles.toolButtonText}>🗑 Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Page navigation */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentPageIdx === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentPageIdx(Math.max(0, currentPageIdx - 1))}
          disabled={currentPageIdx === 0}
        >
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageIndicator}>
          {currentPageIdx + 1} / {pages.length}
        </Text>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentPageIdx >= pages.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={() => setCurrentPageIdx(Math.min(pages.length - 1, currentPageIdx + 1))}
          disabled={currentPageIdx >= pages.length - 1}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Save Progress Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveProgress}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>💾 Save Progress</Text>
            </>
          )}
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
  canvasWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#fefefe',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  paletteSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paletteTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  paletteTabActive: {
    backgroundColor: '#FF6B9D',
  },
  paletteTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  paletteTabTextActive: {
    color: '#fff',
  },
  colorSection: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  colorRow: {
    paddingHorizontal: 12,
    gap: 8,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  colorCircleSelected: {
    borderColor: '#333',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  brushRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  brushOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brushOptionActive: {
    borderColor: '#FF6B9D',
    borderWidth: 2,
    backgroundColor: '#fff0f5',
  },
  toolButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  toolButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FF6B9D',
    borderRadius: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  pageIndicator: {
    fontSize: 15,
    color: '#555',
    fontWeight: '700',
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
