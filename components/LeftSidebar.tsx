// src/components/LeftSidebar.tsx

import { CreateTodoData } from '@/client';
import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
// highlight-start
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// highlight-end

interface LeftSidebarProps {
  onAdd: (createTodoData: CreateTodoData) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onAdd }) => {
  const handleSearch = () => {
    Alert.alert('Search Action', 'You clicked the search button!');
  };

  // The 'handleAdd' alert is no longer needed as the Dialog serves this purpose.

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
        <AntDesign name="search1" size={24} color="black" />
      </TouchableOpacity>

      {/* 
        This Dialog component will open a modal in the center of the screen.
        The DialogTrigger is the button that opens it.
      */}
      {/* highlight-start */}
      <Dialog>
        <DialogTrigger asChild>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="pluscircleo" size={30} color="black" />
          </TouchableOpacity>
        </DialogTrigger>
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle className="native:text-xl">Add a new To-Do</DialogTitle>
            <DialogDescription>
              Fill in the details for your new to-do item below.
              {/* This is where you would add your form fields. */}
            </DialogDescription>
          </DialogHeader>
          {/* You can add form inputs here to use with the 'onAdd' function */}
        </DialogContent>
      </Dialog>
      {/* highlight-end */}
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