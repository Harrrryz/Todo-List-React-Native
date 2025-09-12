// src/screens/CalendarScreen.tsx

import { listTodos, TodoModel } from '@/client';
import { useTodoRefresh } from '@/components/TodoRefreshContext';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator } from 'react-native';
import {
  CalendarProvider,
  CalendarUtils,
  ExpandableCalendar,
  TimelineEventProps,
  TimelineList
} from 'react-native-calendars';

// Helper to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => new Date().toISOString().split('T')[0];

const INITIAL_TIME = { hour: 9, minutes: 0 };

// Simple groupBy implementation
const groupBy = <T,>(array: T[], keyFn: (item: T) => string): { [key: string]: T[] } => {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as { [key: string]: T[] });
};



// Transform TodoModel to TimelineEventProps
const transformTodoToTimelineEvent = (todo: TodoModel): TimelineEventProps => {
  // Parse start and end times
  const startTime = dayjs(todo.start_time);
  const endTime = dayjs(todo.end_time);

  // Generate color based on importance
  const getColorByImportance = (importance: string) => {
    switch (importance) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#4ECDC4';
      case 'low': return '#45B7D1';
      default: return '#95A5A6';
    }
  };

  return {
    start: todo.start_time,
    end: todo.end_time,
    title: todo.item,
    summary: todo.description || '',
    color: getColorByImportance(todo.importance),
    id: todo.id,
  };
};

const CalendarScreen = () => {
  const { refreshKey } = useTodoRefresh();
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [todoList, setTodoList] = useState<TodoModel[]>([]);
  const [events, setEvents] = useState<TimelineEventProps[]>([]);
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: TimelineEventProps[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [dayTodosCache, setDayTodosCache] = useState<{ [key: string]: TodoModel[] }>({});

  // Fetch initial data with one todo per day for calendar marking
  const fetchInitialCalendarData = async () => {
    try {
      setIsLoading(true);
      // Fetch todos from 30 days ago to 30 days in the future
      const startDate = dayjs().subtract(30, 'day').startOf('day').toISOString();
      const endDate = dayjs().add(30, 'day').endOf('day').toISOString();
      
      // First, get all todos in the date range to mark calendar properly
      const response = await listTodos({
        query: {
          start_time_from: startDate,
          start_time_to: endDate,
          pageSize: 200, // Get more items to ensure we get all days with todos
          orderBy: 'start_time',
          sortOrder: 'asc'
        }
      });
      
      const items = response.data?.items || [];
      
      // Group todos by date to get one per day for initial display
      const todosByDate = groupBy(items, (todo) => 
        dayjs(todo.start_time).format('YYYY-MM-DD')
      );
      
      // Take only the first todo from each day for initial display
      const sampledTodos = Object.values(todosByDate).map(dayTodos => dayTodos[0]);
      setTodoList(sampledTodos);
      
      // Transform todos to timeline events for initial display
      const timelineEvents = sampledTodos.map(transformTodoToTimelineEvent);
      setEvents(timelineEvents);
      
      // Group events by date for timeline
      const groupedEvents = groupBy(timelineEvents, (event) => 
        CalendarUtils.getCalendarDateString(event.start)
      );
      setEventsByDate(groupedEvents);
      
      // Cache the full data for each day
      const cacheData: { [key: string]: TodoModel[] } = {};
      Object.entries(todosByDate).forEach(([dateString, dayTodos]) => {
        cacheData[dateString] = dayTodos;
      });
      setDayTodosCache(cacheData);
      
    } catch (error) {
      console.error('Failed to fetch initial calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all todos for a specific day
  const fetchTodosForDay = async (dateString: string) => {
    // Check if we already have full data for this day
    if (dayTodosCache[dateString]) {
      return dayTodosCache[dateString];
    }

    try {
      setIsLoading(true);
      const startOfDay = dayjs(dateString).startOf('day').toISOString();
      const endOfDay = dayjs(dateString).endOf('day').toISOString();
      
      const response = await listTodos({
        query: {
          start_time_from: startOfDay,
          start_time_to: endOfDay,
          pageSize: 100, // Fetch all todos for the day
          orderBy: 'start_time',
          sortOrder: 'asc'
        }
      });
      
      const dayTodos = response.data?.items || [];
      
      // Cache the full day data
      setDayTodosCache(prev => ({
        ...prev,
        [dateString]: dayTodos
      }));
      
      // Update the timeline events for this specific day
      const dayTimelineEvents = dayTodos.map(transformTodoToTimelineEvent);
      const groupedDayEvents = groupBy(dayTimelineEvents, (event) => 
        CalendarUtils.getCalendarDateString(event.start)
      );
      
      setEventsByDate(prev => ({
        ...prev,
        ...groupedDayEvents
      }));
      
      return dayTodos;
    } catch (error) {
      console.error('Failed to fetch todos for day:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialCalendarData();
  }, [refreshKey]);

  // Memoize the marked dates to prevent recalculation on every render
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    // Mark days from the initial todo list (sampled data)
    todoList.forEach(todo => {
      const datePart = dayjs(todo.start_time).format('YYYY-MM-DD');
      if (!datePart) return;
      marks[datePart] = { marked: true, dotColor: '#5092D8' };
    });

    // Also mark days that we have in cache (full day data)
    Object.keys(dayTodosCache).forEach(dateString => {
      if (dayTodosCache[dateString].length > 0) {
        marks[dateString] = { marked: true, dotColor: '#5092D8' };
      }
    });

    return marks;
  }, [todoList, dayTodosCache]);

  // Date change handlers
  const onDateChanged = async (date: string, source: string) => {
    console.log('TimelineCalendarScreen onDateChanged: ', date, source);
    setCurrentDate(date);
    
    // Fetch all todos for the selected day and update timeline
    const dayTodos = await fetchTodosForDay(date);
    
    // Update the timeline events to show all todos for the selected day
    const dayTimelineEvents = dayTodos.map(transformTodoToTimelineEvent);
    const groupedDayEvents = groupBy(dayTimelineEvents, (event) => 
      CalendarUtils.getCalendarDateString(event.start)
    );
    
    setEventsByDate(prev => ({
      ...prev,
      ...groupedDayEvents
    }));
  };

  const onMonthChange = (month: any, updateSource: any) => {
    console.log('TimelineCalendarScreen onMonthChange: ', month, updateSource);
  };

  // Event handlers
  const onEventPress = (event: TimelineEventProps) => {
    Alert.alert(
      event.title,
      event.summary || 'No description available',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const createNewEvent = (timeString: string, timeObject: any) => {
    const hourString = `${(timeObject.hour + 1).toString().padStart(2, '0')}`;
    const minutesString = `${timeObject.minutes.toString().padStart(2, '0')}`;

    const newEvent: TimelineEventProps = {
      id: 'draft',
      start: `${timeString}`,
      end: `${timeObject.date} ${hourString}:${minutesString}:00`,
      title: 'New Todo',
      color: '#95A5A6'
    };

    if (timeObject.date) {
      const updatedEventsByDate = { ...eventsByDate };
      if (updatedEventsByDate[timeObject.date]) {
        updatedEventsByDate[timeObject.date] = [...updatedEventsByDate[timeObject.date], newEvent];
      } else {
        updatedEventsByDate[timeObject.date] = [newEvent];
      }
      setEventsByDate(updatedEventsByDate);
    }
  };

  const approveNewEvent = (_timeString: string, timeObject: any) => {
    Alert.prompt(
      'New Todo',
      'Enter todo title',
      [
        {
          text: 'Cancel',
          onPress: () => {
            if (timeObject.date && eventsByDate[timeObject.date]) {
              const updatedEventsByDate = { ...eventsByDate };
              updatedEventsByDate[timeObject.date] = eventsByDate[timeObject.date].filter(
                e => e.id !== 'draft'
              );
              setEventsByDate(updatedEventsByDate);
            }
          }
        },
        {
          text: 'Create',
          onPress: (eventTitle) => {
            if (timeObject.date && eventsByDate[timeObject.date]) {
              const updatedEventsByDate = { ...eventsByDate };
              const draftEvent = eventsByDate[timeObject.date].find(e => e.id === 'draft');
              if (draftEvent) {
                draftEvent.id = `new-${Date.now()}`;
                draftEvent.title = eventTitle || 'New Todo';
                draftEvent.color = '#4ECDC4';
                updatedEventsByDate[timeObject.date] = [...eventsByDate[timeObject.date]];
                setEventsByDate(updatedEventsByDate);
              }
            }
          }
        }
      ]
    );
  };

  // Timeline props configuration
  const timelineProps = {
    format24h: true,
    onBackgroundLongPress: createNewEvent,
    onBackgroundLongPressOut: approveNewEvent,
    scrollToFirst: true,
    start: 6,
    end: 22,
    unavailableHours: [{ start: 0, end: 6 }, { start: 22, end: 24 }],
    overlapEventsSpacing: 8,
    rightEdgeSpacing: 24
  };

  return (
    <View style={styles.container}>
      <CalendarProvider
        date={currentDate}
        onDateChanged={onDateChanged}
        onMonthChange={onMonthChange}
        showTodayButton
        disabledOpacity={0.6}
      >
        <ExpandableCalendar
          firstDay={1}
          markedDates={markedDates}
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
        <TimelineList
          events={eventsByDate}
          timelineProps={{
            ...timelineProps,
            onEventPress: onEventPress
          }}
          showNowIndicator
          scrollToFirst
          initialTime={INITIAL_TIME}
        />
      </CalendarProvider>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default CalendarScreen;