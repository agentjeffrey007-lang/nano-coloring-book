import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { generateContextualQuestions, synthesizePrompt } from '../utils/promptEngine';
import { generateImage, generateColorVariants } from '../utils/nanoBananaAPI';
import { saveBook } from '../utils/storage';
import GenerationLoadingScreen from './GenerationLoadingScreen';

export default function CreateBookScreen({ navigation }) {
  const [step, setStep] = useState('menu'); // menu, input, questions, chat, generating
  const [userInput, setUserInput] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [generatedPagesCount, setGeneratedPagesCount] = useState(0);
  const [totalPagesToGenerate] = useState(10);
  const [firstGeneratedImage, setFirstGeneratedImage] = useState(null);
  const [allImagesGenerated, setAllImagesGenerated] = useState(false);

  const handleCreateBook = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    const qs = await generateContextualQuestions(userInput);
    setQuestions(qs);
    setCurrentQuestionIndex(0);
    setStep('questions');
    setLoading(false);
  };

  const handleAnswerQuestion = (answer) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: answer };
    setAnswers(newAnswers);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('chat');
    }
  };

  const handleSkipToChat = () => {
    setStep('chat');
  };

  const handleGenerateBook = async () => {
    setLoading(true);
    setStep('generating');
    setGeneratedPagesCount(0);
    setFirstGeneratedImage(null);
    setAllImagesGenerated(false);

    try {
      // 1. Synthesize final prompt
      const finalPrompt = await synthesizePrompt(userInput, answers, chatMessage);

      // 2. Generate base images (10 pages) with progress callback
      const PAGE_COUNT = 10;
      const generatedImages = await generateImage(
        finalPrompt,
        PAGE_COUNT,
        (currentIndex, totalCount, imageData) => {
          setGeneratedPagesCount(currentIndex + 1);
          
          // Store first image when it's ready (now we have actual imageData in callback)
          if (currentIndex === 0 && imageData && !firstGeneratedImage) {
            setFirstGeneratedImage(imageData);
          }
        }
      );

      // Mark all images as generated
      setAllImagesGenerated(true);
      // Ensure first image is set (fallback in case callback didn't catch it)
      if (!firstGeneratedImage && generatedImages[0]) {
        setFirstGeneratedImage(generatedImages[0]);
      }

      // 3. Pre-generate color palettes for each page
      const pagesWithVariants = await Promise.all(
        generatedImages.map(async (img, idx) => {
          const variants = await generateColorVariants(img, idx);
          return {
            image: img,
            colorVariants: variants,
          };
        })
      );

      // 4. Save book to storage
      const book = await saveBook({
        title: userInput,
        prompt: finalPrompt,
        pages: pagesWithVariants,
        images: generatedImages, // flat array for backward compat
      });

      setLoading(false);

      // Navigate to preview with the full data
      navigation.navigate('Preview', {
        images: generatedImages,
        pages: pagesWithVariants,
        prompt: finalPrompt,
        bookId: book.id,
      });
    } catch (error) {
      console.error('Generation error:', error);
      setLoading(false);
      setStep('chat');
    }
  };

  // Show loading screen during generation
  if (step === 'generating') {
    return (
      <GenerationLoadingScreen
        currentPage={generatedPagesCount}
        totalPages={totalPagesToGenerate}
        firstImage={firstGeneratedImage}
        allImagesGenerated={allImagesGenerated}
        isFirstImageReady={!!firstGeneratedImage}
      />
    );
  }

  if (step === 'menu') {
    return (
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🎨</Text>
          <Text style={styles.title}>Create Your{'\n'}Coloring Book</Text>
          <Text style={styles.heroSubtitle}>
            AI-powered custom coloring pages{'\n'}just for you
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => setStep('input')}>
          <Text style={styles.buttonText}>✨ Start Creating</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'input') {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>What would you like to color?</Text>
        <Text style={styles.description}>
          Describe your dream coloring book theme
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Turtles, Space adventure, My dog..."
          value={userInput}
          onChangeText={setUserInput}
          placeholderTextColor="#999"
          autoFocus
        />
        <TouchableOpacity
          style={[styles.button, !userInput.trim() && styles.buttonDisabled]}
          onPress={handleCreateBook}
          disabled={!userInput.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Next →</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'questions') {
    const question = questions[currentQuestionIndex];
    return (
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <Text style={styles.subtitle}>{question.text}</Text>
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {question.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionButton}
              onPress={() => handleAnswerQuestion(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipToChat}>
          <Text style={styles.skipText}>Skip to final details →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'chat') {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Any final touches?</Text>
        <Text style={styles.description}>Optional — add any extra details or just generate!</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="e.g., Add more backgrounds, make it magical..."
          value={chatMessage}
          onChangeText={setChatMessage}
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleGenerateBook}>
          <Text style={styles.buttonText}>🎨 Generate Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={() => setStep('questions')}>
          <Text style={styles.skipText}>← Back to questions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback (should not reach here since generating step returns early)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
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
  buttonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  optionsContainer: {
    marginBottom: 16,
    maxHeight: 300,
  },
  optionButton: {
    backgroundColor: '#f8f8fc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  skipText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 40,
  },
});
