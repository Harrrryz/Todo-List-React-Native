// src/components/FilterButtons.tsx

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FilterPeriod, useFilter } from './FilterContext';

const FilterButtons = () => {
  const { selectedPeriod, setSelectedPeriod } = useFilter();

  const handleFilter = (period: FilterPeriod) => {
    setSelectedPeriod(period);
  };

  const getButtonStyle = (period: FilterPeriod) => {
    return [
      styles.button,
      selectedPeriod === period && styles.activeButton
    ];
  };

  const getButtonTextStyle = (period: FilterPeriod) => {
    return [
      styles.buttonText,
      selectedPeriod === period && styles.activeButtonText
    ];
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle('all')}
        onPress={() => handleFilter('all')}>
        <Text style={getButtonTextStyle('all')}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={getButtonStyle('1day')}
        onPress={() => handleFilter('1day')}>
        <Text style={getButtonTextStyle('1day')}>1 Day</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={getButtonStyle('1week')}
        onPress={() => handleFilter('1week')}>
        <Text style={getButtonTextStyle('1week')}>1 Week</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={getButtonStyle('1month')}
        onPress={() => handleFilter('1month')}>
        <Text style={getButtonTextStyle('1month')}>1 Month</Text>
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
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  activeButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  buttonText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});

export default FilterButtons;