import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/resume/notifications/`;

export interface AppNotification {
  id: number;
  notification_type: 'streak' | 'achievement' | 'digest' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = async (): Promise<AppNotification[]> => {
  try {
    const response = await axios.get<AppNotification[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationRead = async (id: number): Promise<void> => {
  try {
    await axios.patch(`${API_URL}${id}/`, { is_read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const markAllNotificationsRead = async (): Promise<void> => {
  try {
    await axios.post(`${API_URL}mark_all_read/`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};
