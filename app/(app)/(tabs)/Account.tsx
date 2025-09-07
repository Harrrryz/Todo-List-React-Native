// src/screens/AccountScreen.tsx

import { accountProfile, listTodos, TodoModel, User } from '@/client';
import { useSession } from '@/components/ctx';
import { useTodoRefresh } from '@/components/TodoRefreshContext';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert // <-- Import Alert for user feedback
  ,

  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- Import the image picker ---
import * as ImagePicker from 'expo-image-picker';

// --- Main Account Screen Component ---
const AccountScreen = () => {
  const { signOut } = useSession();
  const { refreshKey } = useTodoRefresh();

  // --- State for the avatar image URI ---
  const [avatarUri, setAvatarUri] = useState('https://via.placeholder.com/100');
  const [todoList, setTodoList] = useState<TodoModel[]>([]);
  const [user, setUser] = useState<User | undefined>();

  const handleLogout = () => {
    signOut();
  };

  // --- Function to handle picking an avatar ---
  const handlePickAvatar = async () => {
    // 1. Ask for permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera access to set your avatar.");
      return;
    }

    // 2. Launch the camera
    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,  // Allows the user to crop the image
      aspect: [1, 1],       // Enforces a square aspect ratio for the crop
      quality: 0.7,         // Compress the image to save space
    });

    // 3. Handle the result
    if (pickerResult.canceled === true) {
      return; // User cancelled the camera
    }

    // 4. Update the avatar state with the new image URI
    if (pickerResult.assets && pickerResult.assets.length > 0) {
      setAvatarUri(pickerResult.assets[0].uri);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await accountProfile();
        setUser(userData.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          console.log('Fetching todos on screen focus...');
          const todos = await listTodos();
          setTodoList(todos.data?.items || []);
        } catch (error) {
          console.error("Failed to fetch todos:", error);
        }
      };

      fetchData();

      return () => {
        console.log('Account screen is unfocused.');
      };
    }, [])
  );

  // Update todo list when refresh is triggered from other components
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        console.log('Refreshing todos due to context refresh...');
        const todos = await listTodos();
        setTodoList(todos.data?.items || []);
      } catch (error) {
        console.error("Failed to refresh todos:", error);
      }
    };

    if (refreshKey > 0) { // Only fetch if refreshKey has been triggered
      fetchTodos();
    }
  }, [refreshKey]);

  const totalTasks = todoList.length;

  return (
    <ScrollView style={styles.container}>
      {/* --- Profile Header Section --- */}
      <View style={styles.profileHeader}>
        {/* Make the avatar clickable */}
        <TouchableOpacity onPress={handlePickAvatar}>
          <Image
            source={{ uri: avatarUri }} // Use the state variable for the source
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.email}</Text>
      </View>

      {/* --- Statistics Section --- */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Created</Text>
        </View>
      </View>

      {/* --- Logout Button --- */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>LOG OUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Styles (no changes needed here) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2, // Optional: Add a border to the avatar
    borderColor: '#4A90E2', // Optional: Border color
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#D9534F',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;