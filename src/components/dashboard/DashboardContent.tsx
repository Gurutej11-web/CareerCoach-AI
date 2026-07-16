import React, { useMemo, useState } from 'react';
import { Box, Container, Grid, Typography, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QuickAccessCard from './QuickAccessCard';
import RecentActivity from './RecentActivity';
import StatsOverview from './StatsOverview';
import ScoreProgressChart from './ScoreProgressChart';
import AchievementsPanel from './AchievementsPanel';
import ActivityHeatmap from './ActivityHeatmap';
import GoalsCard from './GoalsCard';
import InterviewCountdown from './InterviewCountdown';
import EmailVerificationBanner from './EmailVerificationBanner';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useRecentActivity } from '../../contexts/RecentActivityContext';
import { generateProgressReportPdf } from '../../utils/pdfReport';

const quickAccessItems = [
  {
    title: 'Resume Tailoring',
    description: 'Optimize your resume for job applications using AI-powered suggestions.',
    icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
    buttonText: 'Get Started',
    linkTo: '/resume',
    activityType: 'resume' as const,
    activityDescription: 'Started Resume Tailoring',
  },
  {
    title: 'Mock Interviews',
    description: 'Practice interviews with our AI interviewer and receive feedback on your responses.',
    icon: <MicIcon sx={{ fontSize: 40 }} />,
    buttonText: 'Start Interview',
    linkTo: '/mock-interview',
    activityType: 'interview' as const,
    activityDescription: 'Started Mock Interview',
  },
  {
    title: 'Interview Chatbot',
    description: 'Get tips and answers to common interview questions from our AI chatbot.',
    icon: <ChatIcon sx={{ fontSize: 40 }} />,
    buttonText: 'Chat Now',
    linkTo: '/chat',
    activityType: 'chatbot' as const,
    activityDescription: 'Started Chatbot Session',
  },
  {
    title: 'AI Career Tools',
    description: 'Salary negotiation scripts, LinkedIn optimization, red-flag detection, and more.',
    icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
    buttonText: 'Explore Tools',
    linkTo: '/ai-tools',
    activityType: 'chatbot' as const,
    activityDescription: 'Opened AI Tools',
  },
];

const DashboardContent: React.FC = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const { activities } = useRecentActivity();

  const filteredQuickAccess = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return quickAccessItems;
    return quickAccessItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }, [debouncedSearch]);

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <EmailVerificationBanner />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ fontSize: '35px', mb: 0 }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search dashboard..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => generateProgressReportPdf(activities)}
            >
              Progress report
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <StatsOverview />
        </Box>

        {filteredQuickAccess.length > 0 && (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {filteredQuickAccess.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <QuickAccessCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  buttonText={item.buttonText}
                  linkTo={item.linkTo}
                  activityType={item.activityType}
                  activityDescription={item.activityDescription}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <ScoreProgressChart />

        <GoalsCard />

        <InterviewCountdown />

        <AchievementsPanel />

        <ActivityHeatmap />

        <RecentActivity filter={debouncedSearch} />
      </Container>
    </Box>
  );
};

export default DashboardContent;
