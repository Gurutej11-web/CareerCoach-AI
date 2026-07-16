import React, { useMemo } from 'react';
import { Grid, Paper, Box, Typography, Skeleton } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useRecentActivity } from '../../contexts/RecentActivityContext';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '100%',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: `${color}22`,
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Paper>
);

const StatsOverview: React.FC = () => {
  const { activities, isLoading } = useRecentActivity();

  const stats = useMemo(() => {
    const resumeCount = activities.filter((a) => a.type === 'resume').length;
    const interviewCount = activities.filter((a) => a.type === 'interview').length;
    const chatbotCount = activities.filter((a) => a.type === 'chatbot').length;

    const scored = activities.filter((a) => typeof a.score === 'number') as (typeof activities[number] & { score: number })[];
    const avgScore = scored.length
      ? Math.round(scored.reduce((sum, a) => sum + a.score, 0) / scored.length)
      : null;

    return { resumeCount, interviewCount, chatbotCount, avgScore };
  }, [activities]);

  if (isLoading) {
    return (
      <Grid container spacing={3} sx={{ mb: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Skeleton variant="rounded" height={92} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 1 }}>
      <Grid item xs={6} md={3}>
        <StatCard icon={<DescriptionIcon />} label="Resumes Analyzed" value={stats.resumeCount} color="#4F46E5" />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard icon={<MicIcon />} label="Interviews Practiced" value={stats.interviewCount} color="#06B6D4" />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard icon={<ChatIcon />} label="Chatbot Sessions" value={stats.chatbotCount} color="#F59E0B" />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard
          icon={<TrendingUpIcon />}
          label="Avg. Interview Score"
          value={stats.avgScore !== null ? stats.avgScore : '—'}
          color="#10B981"
        />
      </Grid>
    </Grid>
  );
};

export default StatsOverview;
