// src/screens/AccountScreen.tsx

import { accountLogin } from '@/client';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


// --- Reusable Row Component for Settings ---
interface SettingsRowProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.settingsRow} onPress={onPress}>

    <Text style={styles.settingsLabel}>{label}</Text>

  </TouchableOpacity>
);

// --- Main Account Screen Component ---
const AccountScreen = () => {
  // Dummy data for the user
  const user = {
    username: 'a@a.com',
    email: 'helloworld@example.com',
    password: 'qweasd', // Placeholder for password
    avatar: 'https://dummyimage.com/150/000000/ffffff&text=HW', // Placeholder image
  };

  const login = async () => {
    const response = await accountLogin({
      body: {
        username: "a@a.com",
        password: "qweasd",
      },
    });
    if (response.status === 201 || response.status === 200) {
      console.log('Login successful');
      localStorage.setItem('token', response.data?.access_token || '');
    } else {
      console.error('Login failed', response.error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', onPress: () => console.log('User logged out') },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={login} style={{ padding: 20, backgroundColor: '#4A90E2', borderRadius: 10, margin: 20 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Login</Text>
      </TouchableOpacity>
      {/* --- Profile Header Section --- */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.userName}>{user.username}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* --- Statistics Section --- */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>42</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>15</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>74%</Text>
          <Text style={styles.statLabel}>Productivity</Text>
        </View>
      </View>

      {/* --- Settings & Actions Section --- */}
      <View style={styles.settingsSection}>
        <SettingsRow
          icon="account-edit-outline"
          label="Edit Profile"
          onPress={() => Alert.alert('Navigate', 'Go to Edit Profile page')}
        />
        <SettingsRow
          icon="bell-outline"
          label="Notifications"
          onPress={() => Alert.alert('Navigate', 'Go to Notifications settings')}
        />
        <SettingsRow
          icon="cog-outline"
          label="App Settings"
          onPress={() => Alert.alert('Navigate', 'Go to App Settings page')}
        />
        <SettingsRow
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => Alert.alert('Navigate', 'Go to Help & Support page')}
        />
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