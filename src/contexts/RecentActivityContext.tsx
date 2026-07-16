import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  // Guards against an out-of-order response: if the login transition (or
  // React StrictMode's double effect invocation) fires more than one fetch
  // in quick succession, an earlier request can resolve *after* a later one
  // and overwrite correct data with stale/empty results. Only the response
  // to the most recently fired request is ever applied.
  const requestIdRef = useRef(0);

  const loadFromBackend = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    const records = await fetchActivities();
    if (requestId !== requestIdRef.current) {
      return; // a newer request superseded this one — discard
    }
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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFromBackend();
    } else {
      // Logged out (or a different user logs in on this device). Bump the
      // request id so any still-in-flight fetch from before logout can't
      // land afterward and repopulate stale data, then clear state.
      requestIdRef.current += 1;
      setActivities([]);
      setIsLoading(false);
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
    <RecentActivityContext.Provider value={{ activities, isLoading, addActivity }}>
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
