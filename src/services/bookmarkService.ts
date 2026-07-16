import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/resume/bookmarks/`;

export interface BookmarkedAnswer {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export async function fetchBookmarks(): Promise<BookmarkedAnswer[]> {
  try {
    const response = await axios.get<BookmarkedAnswer[]>(API_URL);
    return response.data;
  } catch {
    return [];
  }
}

export async function createBookmark(question: string, answer: string): Promise<BookmarkedAnswer | null> {
  try {
    const response = await axios.post<BookmarkedAnswer>(API_URL, { question, answer });
    return response.data;
  } catch {
    return null;
  }
}

export async function deleteBookmark(id: number): Promise<boolean> {
  try {
    await axios.delete(`${API_URL}${id}/`);
    return true;
  } catch {
    return false;
  }
}
