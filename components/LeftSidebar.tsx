// src/components/LeftSidebar.tsx

import { CreateTodoData, Importance, TodoCreate } from '@/client';
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from 'react';
// highlight-start
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
// highlight-end
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LeftSidebarProps {
  onAdd: (createTodoData: CreateTodoData) => void;
  onSearch: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onAdd, onSearch }) => {
  const [todoItem, setTodoItem] = useState('');
  const [todoDescription, setTodoDescription] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Default to 1 hour later
    return now;
  });
  const [alarmTime, setAlarmTime] = useState<Date | undefined>(undefined);
  const [importance, setImportance] = useState<Importance>('none');
  const [tags, setTags] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showAlarmDatePicker, setShowAlarmDatePicker] = useState(false);

  const handleCreateTodo = (): void => {
    let description: string | null = todoDescription ?? null;
    if (todoItem && startTime && endTime) {
      // Validate that end time is after start time
      if (endTime <= startTime) {
        Alert.alert('Error', 'End time must be after start time');
        return;
      }

      const tagsArray = tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : null;

      const data: TodoCreate = {
        item: todoItem,
        description: description,
        starttime: startTime.toISOString(),
        endtime: endTime.toISOString(),
        alarmtime: alarmTime ? alarmTime.toISOString() : null,
        importance: importance,
        tags: tagsArray,
      };
      const finalData: CreateTodoData = {
        body: data,
        url: '/todos',
      };
      onAdd(finalData);
      // Reset form
      setTodoItem('');
      setTodoDescription(undefined);
      setStartTime(new Date());
      setEndTime(() => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return now;
      });
      setAlarmTime(undefined);
      setImportance('none');
      setTags('');
    } else {
      Alert.alert('Error', 'Please fill in the required fields: item, start time, and end time');
    }
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString();
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const onAlarmDateChange = (event: any, selectedDate?: Date) => {
    setShowAlarmDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setAlarmTime(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSearch} style={styles.iconButton}>
        <AntDesign name="search1" size={24} color="black" />
      </TouchableOpacity>

      <Dialog>
        <DialogTrigger asChild>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="pluscircleo" size={30} color="black" />
          </TouchableOpacity>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[80vh]">
          {/* highlight-start */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View className="flex-1 justify-center p-2">
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <DialogHeader>
                  <DialogTitle>Create Todo</DialogTitle>
                  <DialogDescription>
                    Add a new item to your to-do list. Fill in the required fields (*) and click OK when you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
              </TouchableWithoutFeedback>

              <View className="gap-4 py-4">
                <Input
                  placeholder="Enter a new todo item name"
                  value={todoItem}
                  onChangeText={setTodoItem}
                  aria-labelledby="inputLabel"
                  aria-errormessage="inputError"
                />
                <Input
                  placeholder="Enter a todo item description (optional)"
                  value={todoDescription}
                  onChangeText={setTodoDescription}
                  aria-labelledby="inputLabel"
                  aria-errormessage="inputError"
                />

                {/* Start Time */}
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    padding: 12,
                    borderRadius: 6,
                    backgroundColor: 'white'
                  }}
                >
                  <Text style={{ color: startTime ? 'black' : '#999' }}>
                    {startTime ? `Start: ${formatDateTime(startTime)}` : 'Select start time *'}
                  </Text>
                </TouchableOpacity>

                {/* End Time */}
                <TouchableOpacity
                  onPress={() => setShowEndDatePicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    padding: 12,
                    borderRadius: 6,
                    backgroundColor: 'white'
                  }}
                >
                  <Text style={{ color: endTime ? 'black' : '#999' }}>
                    {endTime ? `End: ${formatDateTime(endTime)}` : 'Select end time *'}
                  </Text>
                </TouchableOpacity>

                {/* Alarm Time */}
                <TouchableOpacity
                  onPress={() => setShowAlarmDatePicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    padding: 12,
                    borderRadius: 6,
                    backgroundColor: 'white'
                  }}
                >
                  <Text style={{ color: alarmTime ? 'black' : '#999' }}>
                    {alarmTime ? `Alarm: ${formatDateTime(alarmTime)}` : 'Set alarm time (optional)'}
                  </Text>
                </TouchableOpacity>
                {alarmTime && (
                  <TouchableOpacity
                    onPress={() => setAlarmTime(undefined)}
                    style={{ alignItems: 'center', padding: 8 }}
                  >
                    <Text style={{ color: '#FF6B6B' }}>Clear Alarm</Text>
                  </TouchableOpacity>
                )}

                {/* Importance */}
                <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Importance (optional)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(['none', 'low', 'medium', 'high'] as Importance[]).map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setImportance(level)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: importance === level ? '#007AFF' : '#E0E0E0',
                        backgroundColor: importance === level ? '#007AFF' : 'white'
                      }}
                    >
                      <Text style={{
                        color: importance === level ? 'white' : 'black',
                        textTransform: 'capitalize'
                      }}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tags */}
                <Input
                  placeholder="Enter tags separated by commas (optional)"
                  value={tags}
                  onChangeText={setTags}
                  aria-labelledby="inputLabel"
                  aria-errormessage="inputError"
                />
              </View>

              {/* Date/Time Pickers */}
              {showStartDatePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="datetime"
                  display="default"
                  onChange={onStartDateChange}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="datetime"
                  display="default"
                  onChange={onEndDateChange}
                />
              )}

              {showAlarmDatePicker && (
                <DateTimePicker
                  value={alarmTime || new Date()}
                  mode="datetime"
                  display="default"
                  onChange={onAlarmDateChange}
                />
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button onPress={handleCreateTodo}>
                    <Text>OK</Text>
                  </Button>
                </DialogClose>
              </DialogFooter>
            </View>
          </KeyboardAvoidingView>
          {/* highlight-end */}
        </DialogContent>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  iconButton: {
    marginBottom: 30,
  },
});

export default LeftSidebar;