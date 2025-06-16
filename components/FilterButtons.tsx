// src/components/FilterButtons.tsx

import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FilterButtons = () => {
  const handleFilter = (period: string) => {
    Alert.alert('Filter Action', `Filter by: ${period}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleFilter('1 Day')}>
        <Text style={styles.buttonText}>1 Day</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleFilter('1 Week')}>
        <Text style={styles.buttonText}>1 Week</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleFilter('1 Month')}>
        <Text style={styles.buttonText}>1 Month</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    height: 70, // Fixed height for the button area
  },
  button: {
    flex: 1, // Each button takes equal space
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default FilterButtons;