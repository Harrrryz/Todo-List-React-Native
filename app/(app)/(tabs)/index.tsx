// src/screens/TodoListScreen.tsx

import FilterButtons from '@/components/FilterButtons';
import LeftSidebar from '@/components/LeftSidebar';
import TodoList from '@/components/Todolist';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const TodoListScreen = () => {
  return (
    <View style={styles.container}>
      {/* Part 1: Left Sidebar */}
      <LeftSidebar />

      {/* This View holds the right side content */}
      <View style={styles.mainContent}>
        {/* Part 2: Top Right Filter Buttons */}
        <FilterButtons />

        {/* Part 3: Bottom Right Todo List */}
        <TodoList />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // This is key: places sidebar and main content side-by-side
    backgroundColor: '#F5F7FA',
  },
  mainContent: {
    flex: 1, // This makes the main content take up all remaining space
    flexDirection: 'column', // Arranges children (filters and list) vertically
  },
});

export default TodoListScreen;