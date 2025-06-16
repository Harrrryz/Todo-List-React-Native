// src/screens/CalendarScreen.tsx

import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Todo } from '../types';

// Helper to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Sample data with 'YYYY-MM-DD' due dates
const DUMMY_TODOS: Todo[] = [
  { id: '1', title: 'Buy groceries for the week', dueDate: '2024-05-15', isCompleted: false },
  { id: '2', title: 'Finish React Native report', dueDate: '2024-05-16', isCompleted: false },
  { id: '3', title: 'Call the dentist', dueDate: '2024-05-16', isCompleted: true },
  { id: '4', title: 'Plan weekend trip', dueDate: '2024-05-25', isCompleted: false },
  { id: '5', title: 'Water the plants', dueDate: getTodayDateString(), isCompleted: true },
  { id: '6', title: 'Submit project proposal', dueDate: getTodayDateString(), isCompleted: false },
];

// A reusable TodoItem component, slightly adapted for this context
const TodoItem: React.FC<{ item: Todo }> = ({ item }) => (
  <View style={styles.itemContainer}>

    <View style={styles.itemTextContainer}>
      <Text style={[styles.itemTitle, item.isCompleted && styles.completedText]}>
        {item.title}
      </Text>
    </View>
  </View>
);


const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Memoize the marked dates to prevent recalculation on every render
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    DUMMY_TODOS.forEach(todo => {
      marks[todo.dueDate] = { marked: true, dotColor: '#5092D8' };
    });

    // Add selected date styling
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: '#4A90E2',
      selectedTextColor: 'white',
    };

    return marks;
  }, [DUMMY_TODOS, selectedDate]);

  // Memoize the filtered list of todos for the selected date
  const todosForSelectedDate = useMemo(() => {
    return DUMMY_TODOS.filter(todo => todo.dueDate === selectedDate);
  }, [DUMMY_TODOS, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        // Handler which gets executed on day press.
        onDayPress={onDayPress}
        // Collection of dates that have to be marked.
        markedDates={markedDates}
        // Set the initial month to today
        current={getTodayDateString()}
        // Theme styling for the calendar
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
  completedText: {
    textDecorationLine: 'line-through',
    color: '#A0A0A0',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: '#999'
  }
});

export default CalendarScreen;