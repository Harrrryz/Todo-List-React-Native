import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface TodoRefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  isRefreshing: boolean;
  setIsRefreshing: (refreshing: boolean) => void;
}

const TodoRefreshContext = createContext<TodoRefreshContextType | undefined>(undefined);

interface TodoRefreshProviderProps {
  children: ReactNode;
}

export const TodoRefreshProvider: React.FC<TodoRefreshProviderProps> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = useCallback(() => {
    console.log('TodoRefreshContext: Triggering refresh');
    setRefreshKey(prev => prev + 1);
    setIsRefreshing(true);
    
    // Auto-reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 100);
  }, []);

  const contextValue: TodoRefreshContextType = {
    refreshKey,
    triggerRefresh,
    isRefreshing,
    setIsRefreshing,
  };

  return (
    <TodoRefreshContext.Provider value={contextValue}>
      {children}
    </TodoRefreshContext.Provider>
  );
};

export const useTodoRefresh = (): TodoRefreshContextType => {
  const context = useContext(TodoRefreshContext);
  if (context === undefined) {
    throw new Error('useTodoRefresh must be used within a TodoRefreshProvider');
  }
  return context;
};