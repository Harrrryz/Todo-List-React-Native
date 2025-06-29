// src/components/LeftSidebar.tsx

import { CreateTodoData, TodoCreate } from '@/client';
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
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LeftSidebarProps {
  onAdd: (createTodoData: CreateTodoData) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onAdd }) => {
  const handleSearch = () => {
    Alert.alert('Search Action', 'You clicked the search button!');
  };

  const [todoItem, setTodoItem] = useState('');
  const [todoDescription, setTodoDescription] = useState<string | undefined>(undefined);

  const handleCreateTodo = (): void => {
    let description: string | null = todoDescription ?? null;
    if (todoItem) {
      const data: TodoCreate = {
        item: todoItem,
        description: description,
      };
      const finalData: CreateTodoData = {
        body: data,
        url: '/todos',
      };
      onAdd(finalData);
      setTodoItem('');
      setTodoDescription(undefined);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
        <AntDesign name="search1" size={24} color="black" />
      </TouchableOpacity>

      <Dialog>
        <DialogTrigger asChild>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="pluscircleo" size={30} color="black" />
          </TouchableOpacity>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
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
                    Add a new item to your to-do list. Click OK when you&apos;re done.
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
              </View>
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