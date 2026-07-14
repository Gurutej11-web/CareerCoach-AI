import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Activity {
  id: number;
  type: 'resume' | 'interview' | 'chatbot' | 'application';
  description: string;
  date: string;
  timestamp: number;
  score?: number;
}

const STORAGE_KEY = 'careercoach-recent-activity';
const MAX_STORED_ACTIVITIES = 50;

function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Define the context type
interface RecentActivityContextType {
  activities: Activity[];
  addActivity: (
    type: Activity['type'],
    description: string,
    score?: number
  ) => void;
}

// Create the context
export const RecentActivityContext = createContext<RecentActivityContextType | undefined>(undefined);

// Create a provider component
export const RecentActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(loadActivities);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const addActivity = (
    type: Activity['type'],
    description: string,
    score?: number
  ) => {
    const now = new Date();
    const newActivity: Activity = {
      id: Date.now(),
      type,
      description,
      date: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      timestamp: now.getTime(),
      score,
    };

    setActivities(prev => [newActivity, ...prev].slice(0, MAX_STORED_ACTIVITIES));
  };

  return (
    <RecentActivityContext.Provider value={{ activities, addActivity }}>
      {children}
    </RecentActivityContext.Provider>
  );
};

// Custom hook to use the context
export const useRecentActivity = () => {
  const context = useContext(RecentActivityContext);
  if (context === undefined) {
    throw new Error('useRecentActivity must be used within a RecentActivityProvider');
  }
  return context;
};
