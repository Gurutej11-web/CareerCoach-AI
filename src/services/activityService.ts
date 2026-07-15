import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/resume/activity/`;

export type ActivityType = 'resume' | 'interview' | 'chatbot';

export interface ActivityRecord {
  id: number;
  activity_type: ActivityType;
  description: string;
  score: number | null;
  created_at: string;
}

/**
 * Fetch the authenticated user's activity history from the backend.
 * Returns an empty list (rather than throwing) if the user isn't logged in
 * yet or the request fails, so the dashboard can render gracefully.
 */
export async function fetchActivities(): Promise<ActivityRecord[]> {
  try {
    const response = await axios.get<ActivityRecord[]>(API_URL);
    return response.data;
  } catch (error) {
    return [];
  }
}

/**
 * Log an activity to the user's account on the backend.
 */
export async function createActivity(
  activityType: ActivityType,
  description: string,
  score?: number
): Promise<ActivityRecord | null> {
  try {
    const response = await axios.post<ActivityRecord>(API_URL, {
      activity_type: activityType,
      description,
      score: score ?? null,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to log activity:', error);
    return null;
  }
}
