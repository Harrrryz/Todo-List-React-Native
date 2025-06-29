// src/screens/AccountScreen.tsx

import { listTodos } from '@/client';
import { useSession } from '@/components/ctx';
import React, { useEffect, useState } from 'react';
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
  // Dummy data for the user
  const user = {
    username: 'a@a.com',
    email: 'helloworld@example.com',
    password: 'qweasd', // Placeholder for password
    avatar: 'https://dummyimage.com/150/000000/ffffff&text=HW', // Placeholder image
  };


  const handleLogout = () => {
    signOut()
  };

  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    // Simulate fetching total tasks from an API
    const fetchData = async () => {
      const todos = await listTodos();
      //get numbers of todos
      setTotalTasks(todos.data?.items ? todos.data.items.length : 0);

    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* --- Profile Header Section --- */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.userName}>{user.username}</Text>
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