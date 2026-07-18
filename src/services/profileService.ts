import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export interface PublicPortfolio {
  display_name: string;
  bio: string;
  job_title: string;
  target_role: string;
  career_goal: string;
  location: string;
  skills: string[];
  stats: {
    mock_interviews_completed: number;
    best_resume_match_score: number | null;
  };
}

export const getPublicPortfolio = async (slug: string): Promise<PublicPortfolio> => {
  const response = await axios.get<PublicPortfolio>(`${API_BASE_URL}/users/api/portfolio/${slug}/`);
  return response.data;
};

/** Uploads a new profile picture. Returns the updated profile (with the new picture URL). */
export const uploadProfilePicture = async (file: File): Promise<{ profile_picture: string }> => {
  const formData = new FormData();
  formData.append('profile_picture', file);
  const response = await axios.post(`${API_BASE_URL}/users/api/profile/picture/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/** Resets the profile picture back to the default avatar. */
export const removeProfilePicture = async (): Promise<{ profile_picture: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/users/api/profile/picture/`);
  return response.data;
};

/** Triggers a browser download of the full GDPR-style JSON data export. */
export const exportUserData = async (): Promise<void> => {
  const response = await axios.get(`${API_BASE_URL}/users/api/export-data/`, {
    responseType: 'blob',
  });
  const contentDisposition = response.headers['content-disposition'] as string | undefined;
  const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] || 'careercoach-ai-export.json';

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
