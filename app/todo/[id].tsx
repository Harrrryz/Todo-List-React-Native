// src/screens/TodoDetailScreen.tsx

import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import { Todo } from '@/types';

const TodoDetailScreen = () => {

  const todo: Todo = { id: '1', title: 'Buy groceries for the week', dueDate: 'Due: Tomorrow', isCompleted: false }
  const [detailText, setDetailText] = useState(todo?.detail || '');
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text style={styles.title}>{todo.title}</Text>
          <Text style={styles.dueDate}>{todo.dueDate}</Text>

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
      </TouchableWithoutFeedback>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});


export default TodoDetailScreen;