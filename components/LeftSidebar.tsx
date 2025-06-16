// src/components/LeftSidebar.tsx

import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

const LeftSidebar = () => {
  const handleSearch = () => {
    Alert.alert('Search Action', 'You clicked the search button!');
  };

  const handleAdd = () => {
    Alert.alert('Add Action', 'You clicked the add todo button!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
        <AntDesign name="search1" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleAdd} style={styles.iconButton}>
        <AntDesign name="pluscircleo" size={30} color="black" />
      </TouchableOpacity>
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