import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { fetchActivities, createActivity, ActivityType } from '../services/activityService';
import { useAuth } from './AuthContext';

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  date: string;
  timestamp: number;
  score?: number;
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
//
// Activity is stored server-side, tied to the authenticated account (see
// backend UserActivity model), not in browser localStorage — so it follows
// the account across devices and doesn't leak between different users
// sharing the same browser/device.
export const RecentActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  const loadFromBackend = useCallback(async () => {
    const records = await fetchActivities();
    setActivities(
      records.map((r) => ({
        id: r.id,
        type: r.activity_type,
        description: r.description,
        date: new Date(r.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        timestamp: new Date(r.created_at).getTime(),
        score: r.score ?? undefined,
      }))
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFromBackend();
    } else {
      // Logged out (or a different user logs in on this device) — clear
      // whatever was in memory so it never leaks to the next session.
      setActivities([]);
    }
  }, [isAuthenticated, loadFromBackend]);

  // One-time cleanup: earlier versions of this app stored activity in
  // localStorage under this key. Remove any leftover copy so it can't be
  // mistaken for current data or leak between accounts on shared devices.
  useEffect(() => {
    localStorage.removeItem('careercoach-recent-activity');
  }, []);

  const addActivity = (type: ActivityType, description: string, score?: number) => {
    if (!isAuthenticated) return;

    // Optimistic local update for instant feedback...
    const now = new Date();
    const optimisticActivity: Activity = {
      id: Date.now(),
      type,
      description,
      date: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      timestamp: now.getTime(),
      score,
    };
    setActivities((prev) => [optimisticActivity, ...prev].slice(0, 50));

    // ...then persist to the account on the backend.
    createActivity(type, description, score);
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
