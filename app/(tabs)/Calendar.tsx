// src/screens/CalendarScreen.tsx

import { TodoModel } from '@/client';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

// Helper to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => new Date().toISOString().split('T')[0];


// A reusable TodoItem component, slightly adapted for this context
const TodoItem: React.FC<{ item: TodoModel }> = ({ item }) => (
  <View style={styles.itemContainer}>

    <View style={styles.itemTextContainer}>
      <Text style={[styles.itemTitle, styles.completedText]}>
        {item.item}
      </Text>
    </View>
  </View>
);


const CalendarScreen = (items: TodoModel[]) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Memoize the marked dates to prevent recalculation on every render
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    items.forEach(todo => {
      marks[todo.created_time] = { marked: true, dotColor: '#5092D8' };
    });

    // Add selected date styling
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: '#4A90E2',
      selectedTextColor: 'white',
    };

    return marks;
  }, [items, selectedDate]);

  // Memoize the filtered list of todos for the selected date
  const todosForSelectedDate = useMemo(() => {
    return items.filter(todo => todo.created_time === selectedDate);
  }, [items, selectedDate]);

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