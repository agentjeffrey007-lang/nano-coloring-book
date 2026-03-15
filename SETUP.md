# Nano Coloring Book - Development Setup

## Prerequisites
- Node.js 16+
- npm or yarn
- Xcode (for iOS development)
- Expo CLI (`npm install -g expo-cli`)
- An iPhone/iPad with Expo Go app installed

## Installation

```bash
# Clone the repo
git clone https://github.com/agentjeffrey007-lang/friend-bot.git
cd friend-bot/nano-coloring-book

# Install dependencies
npm install
# or
yarn install
```

## Environment Setup

Create a `.env` file in the root:

```env
NANO_BANANA_API_KEY=your_api_key_here
STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Running on iPhone (Development)

### Option 1: Expo Go (Easiest)

1. **Install Expo Go** on your iPhone from App Store
2. **Start the dev server:**
   ```bash
   npm run start
   ```
3. **Scan the QR code** with your phone's camera or Expo Go app

### Option 2: Build to Physical Device

```bash
# Requires Xcode and Apple Developer Account
npm run ios
```

This builds the app and installs it on your connected iPhone.

## Testing the App

### Home Screen (Create)
- Tap "✏️ Create Book"
- Enter a coloring book idea (e.g., "Turtles")
- Answer contextual questions OR skip to chat
- Add final details
- Hit "Generate Book"

### Preview Screen
- Pinch to zoom
- Tap thumbnails to view different pages
- Proceed to checkout

### My Books Tab
- View saved books
- Tap to color

### Coloring Screen
- Navigate pages
- Select colors from palette
- Color the book

### Checkout
- Choose size, binding, quantity
- See pricing breakdown
- Complete order

## File Structure

```
nano-coloring-book/
├── App.jsx                          # Main navigation
├── screens/
│   ├── CreateBookScreen.jsx         # Guided questions + chat
│   ├── PreviewScreen.jsx            # Full-screen image preview
│   ├── ColoringScreen.jsx           # Interactive coloring
│   ├── MyBooksScreen.jsx            # Saved books
│   └── CheckoutScreen.jsx           # Pricing & order
├── utils/
│   ├── promptEngine.js              # Question generation & prompt synthesis
│   └── nanoBananaAPI.js             # Nano Banana API wrapper
├── package.json
├── app.json                         # Expo config
└── SETUP.md
```

## API Integration

### Nano Banana API
- Endpoint: `https://api.nanobananastudio.com/v1/generate`
- Method: POST
- Required: `NANO_BANANA_API_KEY`
- Response: Array of image URLs

### Stripe
- For production checkout, integrate Stripe React Native
- Currently mocked for testing

## Building for Production

### iOS App Store

```bash
# Create an EAS build (requires EAS account)
npm install -g eas-cli
eas build --platform ios

# Or traditional Xcode build
npm run ios:build
```

### Android (Future)

```bash
npm run android
```

## Troubleshooting

**White screen on startup:**
- Ensure all dependencies installed: `npm install`
- Clear cache: `npm start -- --reset-cache`

**API errors:**
- Check `.env` file has correct API keys
- Verify Nano Banana API key is valid
- For now, fallback images are used if API fails

**Image not loading:**
- Check internet connection
- Verify image URLs from API response
- Use fallback placeholder images in dev

## Next Steps

1. **Get Nano Banana API Key**: Sign up at nanobananastudio.com
2. **Set up Stripe**: Get test keys from stripe.com
3. **Integrate with Print-on-Demand**: Research Blurb/Printful API
4. **Add authentication** (optional): For saved books across devices
5. **Deploy to TestFlight**: For beta testing with friends

## Questions?

Check the main `friend-bot` README for more info on the project structure.
