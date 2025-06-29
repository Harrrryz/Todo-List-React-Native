// src/screens/TodoDetailScreen.tsx

import { getTodo, GetTodoData, TodoModel } from '@/client';
import { Button } from '@/components/ui/button';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
// 1. Import useEffect for state synchronization
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const TodoDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [todo, setTodo] = useState<TodoModel | null>(null);
  // Initialize detailText as an empty string. We'll populate it later.
  const [detailText, setDetailText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This effect will run every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchTodo = async () => {
        if (!id || typeof id !== 'string') {
          setError('Invalid Todo ID.');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        setTodo(null); // Reset previous data

        try {
          const data: GetTodoData = { path: { todo_id: id }, url: "/todos/{todo_id}" };
          const response = await getTodo(data);

          if ('error' in response && response.error) {
            throw new Error(response.error.detail || 'Failed to fetch todo.');
          } else if ('data' in response && response.data) {
            if (typeof response.data === 'string') {
              throw new Error(response.data);
            }
            setTodo(response.data);
          } else {
            throw new Error('Invalid response from server.');
          }
        } catch (e: any) {
          setError(e.message);
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTodo();
    }, [id]) // Re-run if the ID changes
  );

  // 2. This effect synchronizes `detailText` with the fetched `todo` data.
  // It runs ONLY when the `todo` state changes.
  useEffect(() => {
    if (todo) {
      setDetailText(todo.description || '');
    }
  }, [todo]);

  // --- Render Logic ---

  // 3. Handle the loading state
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading Todo...</Text>
      </View>
    );
  }

  // Handle the error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Handle the case where todo is not found but there's no error
  if (!todo) {
    return (
      <View style={styles.centered}>
        <Text>Todo not found.</Text>
      </View>
    );
  }

  // --- Main Component JSX (only rendered when data is ready) ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <View style={{ paddingTop: 40 }}>
        <Button
          className='rounded-none'
          onPress={() => {
            /* authenticate user */
            router.replace('/home');
          }}
        >
          <Text style={{ color: 'black' }}>Back</Text>
        </Button>

      </View>

      <View style={styles.content}>
        {/* 4. It's now safe to access todo properties directly */}
        <View>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Text style={styles.title}>{todo.item}</Text>
          </TouchableWithoutFeedback>
          <Text style={styles.dueDate}>
            Created: {new Date(todo.created_time).toLocaleString()}
          </Text>

        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Add your notes here..."
            value={detailText}
            onChangeText={setDetailText}
            textAlignVertical="top"
          />
        </View>
      </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 80, // You can adjust this value
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {

    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
  },
  textInput: {
    height: 400,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    paddingBottom: 30,
  },
});

export default TodoDetailScreen;