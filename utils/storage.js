import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKS_KEY = 'nano_coloring_books';

export async function saveBook(book) {
  try {
    const books = await loadBooks();
    const newBook = {
      ...book,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    books.unshift(newBook);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    return newBook;
  } catch (error) {
    console.error('Error saving book:', error);
    throw error;
  }
}

export async function loadBooks() {
  try {
    const saved = await AsyncStorage.getItem(BOOKS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading books:', error);
    return [];
  }
}

export async function updateBook(bookId, updates) {
  try {
    const books = await loadBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx >= 0) {
      books[idx] = { ...books[idx], ...updates };
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
      return books[idx];
    }
    return null;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
}

export async function deleteBook(bookId) {
  try {
    const books = await loadBooks();
    const filtered = books.filter((b) => b.id !== bookId);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
}
