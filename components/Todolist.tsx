import { deleteTodo, DeleteTodoData, listTodos, ListTodosData, TodoModel } from '@/client';
import dayjs from 'dayjs';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, VirtualizedList } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useDebounce } from 'use-debounce';
import { FilterPeriod, useFilter } from './FilterContext';
import { Input } from './ui/input';

/**
 * Helper function to filter todos based on the selected period
 */
const filterTodosByPeriod = (todos: TodoModel[], period: FilterPeriod): TodoModel[] => {
  const now = dayjs();

  if (period === 'history') {
    // Show todos where end_time is in the past
    return todos.filter(todo => {
      const todoEndTime = dayjs(todo.end_time);
      return todoEndTime.isBefore(now);
    });
  }

  if (period === 'active') {
    // Show todos where end_time is not in the past (current and future todos)
    return todos.filter(todo => {
      const todoEndTime = dayjs(todo.end_time);
      return todoEndTime.isAfter(now) || todoEndTime.isSame(now, 'day');
    });
  }

  let endDate: dayjs.Dayjs;

  switch (period) {
    case '1day':
      endDate = now.add(1, 'day');
      break;
    case '1week':
      endDate = now.add(1, 'week');
      break;
    case '1month':
      endDate = now.add(1, 'month');
      break;
    default:
      return todos;
  }

  return todos.filter(todo => {
    const todoEndTime = dayjs(todo.end_time);
    // For time-based filters, show active todos within the specified period
    // Active todos are those where end_time is not in the past
    const isActive = todoEndTime.isAfter(now) || todoEndTime.isSame(now, 'day');

    if (!isActive) {
      return false; // Don't show past todos in time-based filters
    }

    // Filter based on start_time for the time period (when the todo is scheduled to start)
    const todoStartTime = dayjs(todo.start_time);
    // Show todos from now until the specified future period
    return todoStartTime.isAfter(now) && (todoStartTime.isBefore(endDate) || todoStartTime.isSame(endDate, 'day'));
  });
};

/**
 * Renders a single todo item in the list with swipe-to-delete functionality.
 */
const TodoItem: React.FC<{ item: TodoModel; onDelete: (id: string) => void }> = ({ item, onDelete }) => {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const SWIPE_THRESHOLD = -100;
  const DELETE_THRESHOLD = -150;

  const handleDelete = () => {
    onDelete(item.id);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      // Only allow swiping to the left (negative values)
      translateX.value = Math.min(0, event.translationX);
    },
    onEnd: (event) => {
      scale.value = withSpring(1);

      if (translateX.value < DELETE_THRESHOLD) {
        // Delete the item
        opacity.value = withSpring(0);
        translateX.value = withSpring(-500, undefined, () => {
          runOnJS(handleDelete)();
        });
      } else if (translateX.value < SWIPE_THRESHOLD) {
        // Show delete hint but don't delete
        translateX.value = withSpring(SWIPE_THRESHOLD);
      } else {
        // Return to original position
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const deleteOpacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD, DELETE_THRESHOLD],
      [0, 0.7, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity: deleteOpacity,
    };
  });

  return (
    <View style={styles.itemWrapper}>
      {/* Delete button behind the item */}
      <Animated.View style={[styles.deleteBackground, deleteButtonStyle]}>
        <Text style={styles.deleteBackgroundText}>Delete</Text>
      </Animated.View>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.itemContainer, animatedStyle]}>
          {/* The main content of the item is a link to the detail page */}
          <Link href={{ pathname: '/todo/[id]', params: { id: item.id } }} asChild style={styles.itemTextContainer}>
            <TouchableOpacity>
              <Text style={styles.itemTitle}>
                {item.item}
              </Text>
              <Text style={styles.itemDueDate}>
                {item.start_time ? `Start: ${dayjs(item.start_time).format('YYYY-MM-DD HH:mm')}` : 'No start date'}
                {item.end_time ? ` | End: ${dayjs(item.end_time).format('YYYY-MM-DD HH:mm')}` : ''}
              </Text>
            </TouchableOpacity>
          </Link>
          {/* A small button on the right to delete the item */}
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

interface RecentTodoListProps {
  refetchKey: number;
  showSearchInput: boolean; // Optional prop to control search input visibility
}

const RecentTodoList: React.FC<RecentTodoListProps> = ({ refetchKey, showSearchInput }) => {
  // State hooks must be called inside the component
  const [todos, setTodos] = useState<TodoModel[]>([]);
  const [allTodos, setAllTodos] = useState<TodoModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>(''); // State for search input
  const [debouncedSearchText] = useDebounce(searchText, 1000);
  const inputRef = useRef<any>(null);
  const { selectedPeriod } = useFilter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const PAGE_SIZE = 5;

  // Move fetchAndSetTodos outside useEffect so it can be reused
  const fetchAndSetTodos = async (page: number = 1, resetData: boolean = true) => {
    try {
      console.log(`Fetching todos page ${page}...`);
      if (resetData) {
        setIsLoading(true);
        setCurrentPage(1);
        setTodos([]);
        setAllTodos([]);
      } else {
        setIsLoadingMore(true);
      }

      const data: ListTodosData = {
        query: {
          currentPage: page,
          pageSize: PAGE_SIZE,
          ...(debouncedSearchText && { searchString: debouncedSearchText })
        },
        url: '/todos',
      };

      const result = await listTodos(data);
      const items = result.data?.items || [];
      const total = result.data?.total || 0;
      const limit = result.data?.limit || PAGE_SIZE;
      const offset = result.data?.offset || 0;

      setTotalItems(total);
      // Check if there are more pages based on current items and total
      const currentItemCount = resetData ? items.length : allTodos.length + items.length;
      setHasNextPage(currentItemCount < total);

      if (resetData) {
        setAllTodos(items);
        const filteredItems = filterTodosByPeriod(items, selectedPeriod);
        setTodos(filteredItems);
        setCurrentPage(1);
      } else {
        // Append new items and remove duplicates by ID
        const newAllTodos = [...allTodos, ...items];
        const uniqueTodos = newAllTodos.filter((todo, index, self) =>
          index === self.findIndex(t => t.id === todo.id)
        );
        setAllTodos(uniqueTodos);
        const filteredItems = filterTodosByPeriod(uniqueTodos, selectedPeriod);
        setTodos(filteredItems);
        setCurrentPage(page);
      }
    } catch (e) {
      console.error('Failed to fetch todos:', e);
      setError('Failed to load todos. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const searchTodos = async () => {
    // Reset pagination when searching
    setCurrentPage(1);
    setHasNextPage(true);
    await fetchAndSetTodos(1, true);
    if (inputRef.current) {
      inputRef.current.blur(); // Optionally blur the input after search
    }
  };

  useEffect(() => {
    fetchAndSetTodos(1, true);
  }, [refetchKey]);

  useEffect(() => {
    if (debouncedSearchText) {
      searchTodos();
    } else {
      // If search is cleared, reset to initial fetch
      fetchAndSetTodos(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText]);

  // Filter todos when selectedPeriod changes
  useEffect(() => {
    const filteredItems = filterTodosByPeriod(allTodos, selectedPeriod);
    setTodos(filteredItems);
  }, [selectedPeriod, allTodos]);

  /**
   * Handles loading more items when reaching the end of the list
   */
  const handleLoadMore = React.useCallback(() => {
    if (!isLoadingMore && hasNextPage && !isLoading) {
      const nextPage = currentPage + 1;
      fetchAndSetTodos(nextPage, false);
    }
  }, [isLoadingMore, hasNextPage, isLoading, currentPage]);

  /**
   * Handles the deletion of a todo item.
   * After a successful deletion, it calls `onDataChange` to trigger a refetch.
   */
  const handleDeleteItem = async (id: string) => {
    try {
      console.log('Deleting todo with ID:', id);
      let todoDeleteData: DeleteTodoData = {
        path: { todo_id: id },
        url: '/todos/{todo_id}',
      };
      await deleteTodo(todoDeleteData);
      // Refetch todos after deletion
      fetchAndSetTodos(1, true);

    } catch (e) {
      console.error('Failed to delete todo:', e);
      Alert.alert('Error', 'Failed to delete the item. Please try again.');
    }
  };

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

  const handleSearch = (text: string): void => {
    setSearchText(text);
    // Reset pagination when searching
    if (!text) {
      setCurrentPage(1);
      setHasNextPage(true);
    }
  };

  /**
   * Renders loading indicator for pagination
   */
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Todos</Text>
      {/* <Text>showSearchInput: {JSON.stringify(showSearchInput)}</Text> */}
      {showSearchInput && (
        <Input
          placeholder='Search todos...'
          value={searchText}
          onChangeText={handleSearch}
          aria-labelledby='inputLabel'
          aria-errormessage='inputError'
          ref={inputRef}
        />
      )}

      {/* Render the list of todos */}
      {todos.length === 0 ? (
        <Text style={styles.emptyText}>No todos found.</Text>
      ) : (
        <VirtualizedList<TodoModel>
          data={todos}
          initialNumToRender={4}
          renderItem={({ item }) => <TodoItem item={item} onDelete={handleDeleteItem} />}
          keyExtractor={(item: TodoModel) => item.id}
          getItemCount={(data) => data?.length || 0}
          getItem={(data, index) => data[index]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          windowSize={10}
        />
      )}
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
  itemWrapper: {
    marginBottom: 10,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 10,
    width: 150,
  },
  deleteBackgroundText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Pushes the text and button to opposite ends
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemTextContainer: {
    flex: 1, // Allows the text container to take up available space
    marginRight: 10, // Add some space before the delete button
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
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
});

export default RecentTodoList;