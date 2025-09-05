// src/screens/CalendarScreen.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

import { listTodos, TodoModel } from '@/client'; // Adjust the import path as necessary
import dayjs from 'dayjs';
// Helper to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => new Date().toISOString().split('T')[0];



// A reusable TodoItem component, without completion styling.
const TodoItem: React.FC<{ item: TodoModel }> = ({ item }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemTextContainer}>
      {/* FIX: Removed unconditional strikethrough style. All items display as active. */}
      <Text style={styles.itemTitle}>
        {item.item}
      </Text>
    </View>
  </View>
);

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  // Calculate the initial date only once to avoid re-calculating on every render
  const [initialDate] = useState(getTodayDateString());
  const [todoList, setTodoList] = useState<TodoModel[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        // Fetch the todo list from the API
        const response = await listTodos();
        const items = response.data?.items || [];
        setTodoList(items);
      } catch (error) {
        console.error('Failed to fetch todos:', error);
      }
    };

    fetchTodos();
  }, []);

  // Memoize the marked dates to prevent recalculation on every render
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    todoList.forEach(todo => {
      // Extract only the date part (YYYY-MM-DD) from the full timestamp
      const datePart = dayjs(todo.start_time).format('YYYY-MM-DD');
      console.log(`Marking date: ${datePart} for todo: ${todo.item}`);
      if (!datePart) return;
      marks[datePart] = { marked: true, dotColor: '#5092D8' };
    });


    // Add selected date styling
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: '#4A90E2',
      selectedTextColor: 'white',
    };

    return marks;
  }, [todoList, selectedDate]);

  // Memoize the filtered list of todos for the selected date
  const todosForSelectedDate = useMemo(() => {
    // Filter by comparing only the date part of the timestamp
    return todoList.filter(todo => dayjs(todo.start_time).format('YYYY-MM-DD') === selectedDate);
  }, [todoList, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        current={initialDate}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#4A90E2',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#4A90E2',
          dayTextColor: '#2d4150',
          arrowColor: '#4A90E2',
        }}
      />
      <View style={styles.todoListContainer}>
        <Text style={styles.listTitle}>Todos for {selectedDate}</Text>
        <FlatList
          data={todosForSelectedDate}
          renderItem={({ item }) => <TodoItem item={item} />}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No todos for this day. Enjoy!</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  todoListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listTitle: {
    fontSize: 18,
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
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
  },
  // FIX: Removed unused 'completedText' style
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: '#999',
  },
});

export default CalendarScreen;