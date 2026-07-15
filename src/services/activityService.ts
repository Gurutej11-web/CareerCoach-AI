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

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Fetch the authenticated user's activity history from the backend.
 * Returns an empty list (rather than throwing) if the user isn't logged in
 * yet or the request fails, so the dashboard can render gracefully.
 *
 * The endpoint is paginated (20/page) so long-lived accounts can page back
 * through their full history; this fetches the most recent `pageSize`
 * entries (default 50) by requesting a single larger page rather than
 * following `next` links, since the dashboard just needs a recent-activity
 * feed, not full pagination UI.
 */
export async function fetchActivities(pageSize = 50): Promise<ActivityRecord[]> {
  try {
    const response = await axios.get<PaginatedResponse<ActivityRecord> | ActivityRecord[]>(
      API_URL,
      { params: { page_size: pageSize } }
    );
    const data = response.data;
    return Array.isArray(data) ? data : data.results;
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
