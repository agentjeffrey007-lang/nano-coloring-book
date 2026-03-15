import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import CreateBookScreen from './screens/CreateBookScreen';
import MyBooksScreen from './screens/MyBooksScreen';
import ColoringScreen from './screens/ColoringScreen';
import PreviewScreen from './screens/PreviewScreen';
import CheckoutScreen from './screens/CheckoutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: '#333',
  headerTitleStyle: { fontWeight: 'bold' },
};

function HomeTab() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="CreateBook"
        component={CreateBookScreen}
        options={{ title: 'Create Book' }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{ title: 'Preview' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
    </Stack.Navigator>
  );
}

function BooksTab() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="MyBooks"
        component={MyBooksScreen}
        options={{ title: 'My Books' }}
      />
      <Stack.Screen
        name="Coloring"
        component={ColoringScreen}
        options={{ title: 'Color' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#eee',
          },
          tabBarActiveTintColor: '#FF6B9D',
          tabBarInactiveTintColor: '#999',
        }}
      >
        <Tab.Screen
          name="Create"
          component={HomeTab}
          options={{
            tabBarLabel: 'Create',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>✏️</Text>,
          }}
        />
        <Tab.Screen
          name="Books"
          component={BooksTab}
          options={{
            tabBarLabel: 'My Books',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>📚</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
