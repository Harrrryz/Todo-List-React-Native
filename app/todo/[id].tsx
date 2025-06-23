// src/screens/TodoDetailScreen.tsx

import { TodoModel } from '@/client';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';



const TodoDetailScreen = () => {

  const todo: TodoModel = {
    id: '1', item: 'Buy groceries for the week',
    description: 'Remember to buy fruits, vegetables, and snacks.',
    created_time: '2023-10-01T12:00:00Z',
    importance: 'none',
    user_id: ''
  }
  const [detailText, setDetailText] = useState(todo?.description || '');
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text style={styles.title}>{todo.item}</Text>
          <Text style={styles.dueDate}>{todo.created_time}</Text>

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