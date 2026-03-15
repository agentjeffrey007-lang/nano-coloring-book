import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

export default function CheckoutScreen({ route, navigation }) {
  const { images, prompt } = route.params;
  const [bookName, setBookName] = useState('My Coloring Book');
  const [format, setFormat] = useState('8x10'); // 8x10, 11x14
  const [binding, setBinding] = useState('softcover'); // softcover, hardcover
  const [quantity, setQuantity] = useState(1);
  const [secondBook, setSecondBook] = useState(false);

  const basePrice = format === '8x10' ? 12.99 : 16.99;
  const bindingPrice = binding === 'hardcover' ? 8.0 : 0;
  const bookPrice = basePrice + bindingPrice;
  const subtotal = quantity * bookPrice + (secondBook ? bookPrice * 0.75 : 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    // Mock checkout for now - Stripe will be integrated later
    Alert.alert(
      'Order Confirmed',
      `Total: $${total.toFixed(2)}\nShips in 4-6 weeks\n\n(Stripe integration coming soon)`,
      [{ text: 'OK', onPress: () => navigation.popToTop() }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      {/* Book Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Book Name</Text>
        <TextInput
          style={styles.input}
          value={bookName}
          onChangeText={setBookName}
          placeholder="My Coloring Book"
        />
      </View>

      {/* Format Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size</Text>
        <View style={styles.optionsRow}>
          {['8x10', '11x14'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.option, format === f && styles.optionSelected]}
              onPress={() => setFormat(f)}
            >
              <Text style={[styles.optionText, format === f && styles.optionTextSelected]}>
                {f} (${f === '8x10' ? '12.99' : '16.99'})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Binding Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Binding</Text>
        <View style={styles.optionsRow}>
          {['softcover', 'hardcover'].map((b) => (
            <TouchableOpacity
              key={b}
              style={[styles.option, binding === b && styles.optionSelected]}
              onPress={() => setBinding(b)}
            >
              <Text style={[styles.optionText, binding === b && styles.optionTextSelected]}>
                {b.charAt(0).toUpperCase() + b.slice(1)} {b === 'hardcover' ? '+$8' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quantity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Text style={styles.quantityButton}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Second Book */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.option, secondBook && styles.optionSelected]}
          onPress={() => setSecondBook(!secondBook)}
        >
          <Text style={[styles.optionText, secondBook && styles.optionTextSelected]}>
            Add Second Book (25% off)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pricing */}
      <View style={styles.pricingContainer}>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Subtotal:</Text>
          <Text style={styles.pricingValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Tax (8%):</Text>
          <Text style={styles.pricingValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.pricingRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Note */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          📦 Print-on-demand delivery: 4-6 weeks. Orders only placed after purchase.
        </Text>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Complete Order</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  optionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityButton: {
    fontSize: 24,
    color: '#FF6B9D',
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pricingContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  noteContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  checkoutButton: {
    backgroundColor: '#FF6B9D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FF6B9D',
    fontSize: 14,
  },
});
