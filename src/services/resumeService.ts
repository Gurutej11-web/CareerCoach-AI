import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/resume/`;

/**
 * Interface for resume analysis results
 */
export interface ResumeAnalysisResult {
  keywordsToAdd: string[];
  keywordsToRemove: string[];
  formatSuggestions?: string[];
  contentSuggestions: string[];
  matchScore: number;
  technicalSkillsMatch?: {
    inJob: string[];
    inResume: string[];
    missing: string[];
  };
  softSkillsMatch?: {
    inJob: string[];
    inResume: string[];
    missing: string[];
  };
  sentimentAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  readability?: {
    score: number | null;
    label: string;
  };
  industryKeywordsMatched?: string[];
  resumeText?: string;
  analysisId?: number;
}

/**
 * Uploads resume and job description files to the API for analysis
 */
export const analyzeResume = async (
  resumeFile: File,
  jobDescFile: File,
  industry?: string
): Promise<ResumeAnalysisResult> => {
  const formData = new FormData();
  formData.append('resume_file', resumeFile);
  formData.append('job_desc_file', jobDescFile);
  if (industry) {
    formData.append('industry', industry);
  }

  try {
    const response = await axios.post<ResumeAnalysisResult>(
      `${API_URL}analyze/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Add debug logging
    console.log("Full API response:", response.data);
    console.log("Sentiment Analysis in response:", response.data.sentimentAnalysis);

    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

/**
 * Industry-specific keyword libraries available for resume analysis
 */
export interface IndustryKeywordLibrary {
  id: string;
  label: string;
  keywords: string[];
}

export const getKeywordLibraries = async (): Promise<IndustryKeywordLibrary[]> => {
  try {
    const response = await axios.get<{ industries: IndustryKeywordLibrary[] }>(
      `${API_URL}keyword-libraries/`
    );
    return response.data.industries;
  } catch (error) {
    console.error('Error fetching keyword libraries:', error);
    return [];
  }
};

/**
 * Downloads a tailored .docx reconstruction of a saved resume analysis.
 */
export const downloadTailoredResume = async (analysisId: number): Promise<void> => {
  const response = await axios.get(`${API_URL}analyses/${analysisId}/download/`, {
    withCredentials: true,
    responseType: 'blob',
  });
  const contentDisposition = response.headers['content-disposition'] as string | undefined;
  const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] || 'tailored-resume.docx';

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Get all resumes for the authenticated user
 */
export const getUserResumes = async () => {
  try {
    const response = await axios.get(`${API_URL}resumes/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    throw error;
  }
};

/**
 * Get all job descriptions for the authenticated user
 */
export const getUserJobDescriptions = async () => {
  try {
    const response = await axios.get(`${API_URL}job-descriptions/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

/**
 * Get all resume analyses for the authenticated user
 */
export const getUserAnalyses = async () => {
  try {
    const response = await axios.get(`${API_URL}analyses/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching resume analyses:', error);
    throw error;
  }
};

/**
 * Send a message to the interview chatbot and get a response
 */
export interface ChatResponse {
  message: string;
  session_id: string;
  follow_up_questions?: string[];
  quota?: { limit: number; remaining: number; resets_in_seconds: number };
}

export const sendChatMessage = async (
  message: string,
  sessionId?: string,
  options?: { mode?: 'advice' | 'reverse'; jobPosting?: string; wantFollowUps?: boolean }
): Promise<ChatResponse> => {
  try {
    const response = await axios.post<ChatResponse>(
      `${API_URL}interview/chat/`,
      {
        message,
        session_id: sessionId || '',
        mode: options?.mode || 'advice',
        job_posting: options?.jobPosting || '',
        want_follow_ups: Boolean(options?.wantFollowUps),
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get chatbot FAQ topics
 */
export interface FAQTopicsResponse {
  topics: string[];
}

export const getChatbotFAQTopics = async (): Promise<FAQTopicsResponse> => {
  try {
    const response = await axios.get<FAQTopicsResponse>(
      `${API_URL}interview/faq-topics/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching FAQ topics:', error);
    throw error;
  }
};

/**
 * Get chat history for a specific session
 */
export interface ChatMessage {
  id: number;
  user: number;
  message: string;
  is_user: boolean;
  timestamp: string;
  session_id: string;
}

export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const response = await axios.get<ChatMessage[]>(
      `${API_URL}interview/history/?session_id=${sessionId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Get all chat sessions for the authenticated user
 */
export interface ChatSession {
  session_id: string;
  title: string;
  last_updated: string;
}

export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const response = await axios.get<ChatSession[]>(
      `${API_URL}interview/sessions/`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
}; 