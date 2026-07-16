import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/resume/ai-tools/generate/`;

export type AIToolId =
  | 'salary_negotiation'
  | 'linkedin_headline'
  | 'job_red_flags'
  | 'networking_message'
  | 'skill_gap'
  | 'company_research'
  | 'elevator_pitch'
  | 'thank_you_note'
  | 'interview_predictor'
  | 'bullet_rewriter'
  | 'cover_letter';

export interface AIToolResponse {
  tool: string;
  label: string;
  result: string;
}

export async function generateWithAITool(tool: AIToolId, input: string): Promise<AIToolResponse> {
  const response = await axios.post<AIToolResponse>(API_URL, { tool, input });
  return response.data;
}
