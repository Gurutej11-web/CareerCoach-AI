import React, { useState } from 'react';
import {
  Box, Container, Grid, Card, CardActionArea, CardContent, Typography, TextField, Button,
  Paper, CircularProgress, Alert, IconButton, Tooltip,
} from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import BadgeIcon from '@mui/icons-material/Badge';
import FlagIcon from '@mui/icons-material/Flag';
import ForumIcon from '@mui/icons-material/Forum';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import CampaignIcon from '@mui/icons-material/Campaign';
import MailIcon from '@mui/icons-material/Mail';
import QuizIcon from '@mui/icons-material/Quiz';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ArticleIcon from '@mui/icons-material/Article';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PageHeader from '../components/common/PageHeader';
import { generateWithAITool, AIToolId } from '../services/aiToolsService';
import { useRecentActivity } from '../contexts/RecentActivityContext';
import { useNotification } from '../contexts/NotificationContext';
import { extractApiErrorMessage } from '../utils/apiError';

interface ToolConfig {
  id: AIToolId;
  title: string;
  description: string;
  icon: React.ReactNode;
  placeholder: string;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'salary_negotiation',
    title: 'Salary Negotiation Coach',
    description: 'Get a negotiation script and tips based on your offer.',
    icon: <PaidIcon />,
    placeholder: 'e.g. Offer is $95k for Software Engineer, I was expecting $110k based on market research, 3 years experience...',
  },
  {
    id: 'linkedin_headline',
    title: 'LinkedIn Headline & Summary',
    description: 'Generate headline and About-section options.',
    icon: <BadgeIcon />,
    placeholder: 'e.g. I\'m a frontend developer with 4 years experience in React, looking for senior roles...',
  },
  {
    id: 'job_red_flags',
    title: 'Job Posting Red-Flag Detector',
    description: 'Paste a job description to spot warning signs.',
    icon: <FlagIcon />,
    placeholder: 'Paste the full job description here...',
  },
  {
    id: 'networking_message',
    title: 'Networking Message Generator',
    description: 'Draft a cold outreach message.',
    icon: <ForumIcon />,
    placeholder: 'e.g. I want to reach out to a senior PM at Stripe I found on LinkedIn to ask about their team...',
  },
  {
    id: 'skill_gap',
    title: 'Skill Gap Analyzer',
    description: 'Compare your skills to a target role.',
    icon: <SchoolIcon />,
    placeholder: 'e.g. Current skills: Python, SQL, basic ML. Target role: Machine Learning Engineer...',
  },
  {
    id: 'company_research',
    title: 'Company Research Briefing',
    description: 'Get a quick briefing before your interview.',
    icon: <BusinessIcon />,
    placeholder: 'e.g. Company name: Acme Corp, interviewing for a backend engineer role...',
  },
  {
    id: 'elevator_pitch',
    title: 'Elevator Pitch Generator',
    description: 'A 30-second spoken pitch about you.',
    icon: <CampaignIcon />,
    placeholder: 'e.g. 5 years in product design, targeting senior product designer roles at startups...',
  },
  {
    id: 'thank_you_note',
    title: 'Post-Interview Thank-You Note',
    description: 'A short, warm follow-up email.',
    icon: <MailIcon />,
    placeholder: 'e.g. Interviewed for Data Analyst role with Jane (Engineering Manager), discussed SQL and dashboards...',
  },
  {
    id: 'interview_predictor',
    title: 'Interview Question Predictor',
    description: 'Likely questions based on a job posting.',
    icon: <QuizIcon />,
    placeholder: 'Paste the job description here...',
  },
  {
    id: 'bullet_rewriter',
    title: 'Resume Bullet-Point Rewriter',
    description: 'Turn duties into quantified achievements.',
    icon: <FormatListBulletedIcon />,
    placeholder: 'e.g. Responsible for managing social media accounts\nHelped onboard new employees...',
  },
  {
    id: 'cover_letter',
    title: 'Cover Letter Generator',
    description: 'A tailored cover letter draft.',
    icon: <ArticleIcon />,
    placeholder: 'e.g. My background: 3 years in marketing, led 2 product launches. Applying for: Marketing Manager at Acme Corp...',
  },
  {
    id: 'ats_checker',
    title: 'ATS Compatibility Checker',
    description: 'Spot formatting issues that break resume parsers.',
    icon: <FactCheckIcon />,
    placeholder: 'Paste your resume text here...',
  },
];

const AITools: React.FC = () => {
  const [selected, setSelected] = useState<ToolConfig | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addActivity } = useRecentActivity();
  const { notify } = useNotification();

  const handleSelect = (tool: ToolConfig) => {
    setSelected(tool);
    setInput('');
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selected || !input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await generateWithAITool(selected.id, input.trim());
      setResult(response.result);
      addActivity('chatbot', `Used AI Tool: ${selected.title}`);
    } catch (err: any) {
      setError(extractApiErrorMessage(err, 'Something went wrong generating this. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    notify('Copied to clipboard', 'success');
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <PageHeader
          title="AI Career Tools"
          subtitle="A toolbox of AI-powered helpers for every stage of your job search"
        />

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {TOOLS.map((tool) => (
            <Grid item xs={12} sm={6} md={4} key={tool.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderColor: selected?.id === tool.id ? 'primary.main' : 'divider',
                  borderWidth: selected?.id === tool.id ? 2 : 1,
                }}
              >
                <CardActionArea onClick={() => handleSelect(tool)} sx={{ height: '100%', p: 1 }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 1 }}>{tool.icon}</Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {tool.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tool.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selected && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {selected.title}
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              placeholder={selected.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleGenerate} disabled={!input.trim() || loading}>
              {loading ? <CircularProgress size={22} /> : 'Generate'}
            </Button>

            {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

            {result && (
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover', position: 'relative' }}>
                <Tooltip title="Copy to clipboard">
                  <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleCopy}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pr: 4 }}>
                  {result}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AITools;
