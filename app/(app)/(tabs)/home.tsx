// src/screens/TodoListScreen.tsx

import { CreateTodoData } from '@/client';
import { createTodo } from '@/client/sdk.gen';
import FilterButtons from '@/components/FilterButtons';
import LeftSidebar from '@/components/LeftSidebar';
import TodoList from '@/components/Todolist';
import { useTodoRefresh } from '@/components/TodoRefreshContext';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const TodoListScreen = () => {
  const { refreshKey, triggerRefresh } = useTodoRefresh();
  const [addTodoRefactorKey, setAddTodoRefactorKey] = useState(0);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleAddTodo = async (createTodoData: CreateTodoData) => {
    try {

      await createTodo(createTodoData)
      setAddTodoRefactorKey(prevKey => prevKey + 1);

    } catch (error) {
      console.error("Error creating todo:", error);
    }
  }

  const handleSearch = () => {
    // Placeholder for search functionality
    setShowSearchInput(!showSearchInput);
    console.log("Search button clicked, showSearchInput:", showSearchInput);
  };

  return (
    <View style={styles.container}>
      {/* Part 1: Left Sidebar */}
      <LeftSidebar onAdd={handleAddTodo} onSearch={handleSearch} />

      {/* This View holds the right side content */}
      <View style={styles.mainContent}>
        {/* Part 2: Top Right Filter Buttons */}
        <FilterButtons />

        {/* Part 3: Bottom Right Todo List */}
        <TodoList refetchKey={addTodoRefactorKey + refreshKey} showSearchInput={showSearchInput} />
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