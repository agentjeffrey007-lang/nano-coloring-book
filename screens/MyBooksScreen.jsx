import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadBooks, deleteBook } from '../utils/storage';

export default function MyBooksScreen({ navigation }) {
  const [books, setBooks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadBooks().then(setBooks);
    }, [])
  );

  const handleDelete = (bookId, title) => {
    Alert.alert('Delete Book', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteBook(bookId);
          const updated = await loadBooks();
          setBooks(updated);
        },
      },
    ]);
  };

  const renderBook = ({ item }) => {
    const thumbnail = item.images?.[0] || item.pages?.[0]?.image;
    const pageCount = item.images?.length || item.pages?.length || 0;
    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate('Coloring', { book: item })}
        onLongPress={() => handleDelete(item.id, item.title)}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.bookThumbnail} />
        ) : (
          <View style={[styles.bookThumbnail, styles.placeholderThumb]}>
            <Text style={styles.placeholderEmoji}>📖</Text>
          </View>
        )}
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {item.title || 'Untitled Book'}
          </Text>
          <Text style={styles.bookDescription} numberOfLines={2}>
            {item.prompt || 'No description'}
          </Text>
          <View style={styles.bookMetaRow}>
            <Text style={styles.bookMeta}>{pageCount} pages</Text>
            {item.pages?.[0]?.colorVariants?.length > 0 && (
              <Text style={styles.bookMeta}>
                • {item.pages[0].colorVariants.length} palettes
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>No books yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first coloring book{'\n'}from the Create tab!
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    padding: 16,
  },
  bookCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  bookThumbnail: {
    width: 80,
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  placeholderThumb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 28,
  },
  bookInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  bookDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    lineHeight: 18,
  },
  bookMetaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bookMeta: {
    fontSize: 11,
    color: '#bbb',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
    paddingRight: 14,
    fontWeight: '300',
  },
});
