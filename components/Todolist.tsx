// src/components/RecentTodoList.tsx

import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Todo } from '../app/types';


// Sample data to display in the list
const DUMMY_TODOS: Todo[] = [
  { id: '1', title: 'Buy groceries for the week', dueDate: 'Due: Tomorrow', isCompleted: false },
  { id: '2', title: 'Finish React Native report', dueDate: 'Due: In 2 days', isCompleted: false },
  { id: '3', title: 'Call the dentist', dueDate: 'Due: In 3 days', isCompleted: true },
  { id: '4', title: 'Plan weekend trip', dueDate: 'Due: This Friday', isCompleted: false },
  { id: '5', title: 'Water the plants', dueDate: 'Due: Tomorrow', isCompleted: true },
];

interface TodoItemProps {
  item: Todo;
}

const TodoItem: React.FC<TodoItemProps> = ({ item }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemTextContainer}>
      <Text style={[styles.itemTitle, item.isCompleted && styles.completedText]}>
        {item.title}
      </Text>
      <Text style={[styles.itemDueDate, item.isCompleted && styles.completedText]}>
        {item.dueDate}
      </Text>
    </View>
  </View>
);


const RecentTodoList = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Todos</Text>
      <FlatList
        data={DUMMY_TODOS}
        renderItem={({ item }) => <TodoItem item={item} />}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes up remaining vertical space
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemIcon: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
  },
  itemDueDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#A0A0A0',
  },
});

export default RecentTodoList;