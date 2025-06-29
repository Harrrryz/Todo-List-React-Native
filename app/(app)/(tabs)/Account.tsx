// src/screens/AccountScreen.tsx

import { accountProfile, listTodos, TodoModel, User } from '@/client';
import { useSession } from '@/components/ctx';
// 1. Import useFocusEffect from React Navigation
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react'; // <-- Import useCallback
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Main Account Screen Component ---
const AccountScreen = () => {
  const { signOut } = useSession();

  const handleLogout = () => {
    signOut();
  };

  const [todoList, setTodoList] = useState<TodoModel[]>([]);
  const [user, setUser] = useState<User | undefined>();

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
      // This function will run every time the screen comes into focus
      const fetchData = async () => {
        try {
          console.log('Fetching todos on screen focus...');
          const todos = await listTodos();
          setTodoList(todos.data?.items || []);
        } catch (error) {
          console.error("Failed to fetch todos:", error);
          // Optionally handle the error in the UI
        }
      };

      fetchData();

      // Optional: You can return a cleanup function that runs when the screen goes out of focus
      return () => {
        console.log('Account screen is unfocused.');
        // For example, you could cancel a subscription here
      };
    }, []) // Empty dependency array means the callback itself doesn't depend on any props or state
  );

  const totalTasks = todoList.length;

  return (
    <ScrollView style={styles.container}>
      {/* --- Profile Header Section --- */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
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

// ... your styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  // Profile Header
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
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  // Statistics Section
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
  // Settings Section
  settingsSection: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsIcon: {
    marginRight: 20,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  // Logout Button
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