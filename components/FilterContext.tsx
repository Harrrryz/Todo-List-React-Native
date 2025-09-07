import React, { createContext, ReactNode, useContext, useState } from 'react';

export type FilterPeriod = 'all' | '1day' | '1week' | '1month';

interface FilterContextType {
  selectedPeriod: FilterPeriod;
  setSelectedPeriod: (period: FilterPeriod) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('all');

  const contextValue: FilterContextType = {
    selectedPeriod,
    setSelectedPeriod,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};