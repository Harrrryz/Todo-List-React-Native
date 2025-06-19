import { listTodos, TodoModel } from '@/client';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';




/**
 * Renders a single todo item in the list.
 */
const TodoItem: React.FC<{ item: TodoModel }> = ({ item }) => (
  <TouchableWithoutFeedback>
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemTitle]}>
          {item.item}
        </Text>
        <Link href={{
          pathname: '/todo/[id]',
          params: { id: item.id }
        }} asChild>
          <Text style={[styles.itemDueDate]}>
            {item.created_time}
          </Text>
        </Link>
      </View>
    </View>
  </TouchableWithoutFeedback>
);


const RecentTodoList = () => {
  // State hooks must be called inside the component
  const [todos, setTodos] = useState<TodoModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchAndSetTodos = async () => {
      try {
        setIsLoading(true);
        const result = await listTodos();
        const items = result.data?.items || [];
        setTodos(items);
      } catch (e) {
        console.error('Failed to fetch todos:', e);
        setError('Failed to load todos. Please try again later.');

      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetTodos();
  }, []);


  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading Todos...</Text>
      </View>
    );
  }


  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Todos</Text>
      <FlatList
        data={todos} // Use the state variable for data
        renderItem={({ item }) => <TodoItem item={item} />}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No todos found.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
  },
  itemDueDate: {
    fontSize: 12,
    color: '#007AFF', // Making links look more like links
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#A0A0A0',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  }
});

export default RecentTodoList;