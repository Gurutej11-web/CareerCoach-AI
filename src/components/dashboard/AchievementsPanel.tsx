import React, { useMemo } from 'react';
import { Paper, Typography, Box, Tooltip, Grid } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DescriptionIcon from '@mui/icons-material/Description';
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import { useRecentActivity, Activity } from '../../contexts/RecentActivityContext';

interface Badge {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

function computeStreak(activities: Activity[]): number {
  if (activities.length === 0) return 0;

  const dayKeys = new Set(
    activities.map((a) => new Date(a.timestamp).toDateString())
  );

  let streak = 0;
  const cursor = new Date();

  // If nothing happened today yet, the streak can still count from yesterday.
  if (!dayKeys.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dayKeys.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

const AchievementsPanel: React.FC = () => {
  const { activities } = useRecentActivity();

  const streak = useMemo(() => computeStreak(activities), [activities]);

  const counts = useMemo(() => {
    const resume = activities.filter((a) => a.type === 'resume').length;
    const interview = activities.filter((a) => a.type === 'interview').length;
    const chatbot = activities.filter((a) => a.type === 'chatbot').length;
    const highScore = activities.some((a) => typeof a.score === 'number' && a.score >= 90);
    return { resume, interview, chatbot, highScore };
  }, [activities]);

  const badges: Badge[] = [
    {
      id: 'first-resume',
      label: 'First Resume Analysis',
      description: 'Analyze your first resume',
      icon: <DescriptionIcon />,
      unlocked: counts.resume >= 1,
    },
    {
      id: 'first-interview',
      label: 'First Mock Interview',
      description: 'Complete your first mock interview',
      icon: <MicIcon />,
      unlocked: counts.interview >= 1,
    },
    {
      id: 'chatbot-explorer',
      label: 'Chatbot Explorer',
      description: 'Chat with the interview assistant 3 times',
      icon: <ChatIcon />,
      unlocked: counts.chatbot >= 3,
    },
    {
      id: 'high-scorer',
      label: 'High Scorer',
      description: 'Score 90 or above on an analysis',
      icon: <StarIcon />,
      unlocked: counts.highScore,
    },
    {
      id: 'streak-3',
      label: '3-Day Streak',
      description: 'Use CareerCoach AI 3 days in a row',
      icon: <LocalFireDepartmentIcon />,
      unlocked: streak >= 3,
    },
    {
      id: 'all-rounder',
      label: 'All-Rounder',
      description: 'Try resume, interview, and chatbot features',
      icon: <EmojiEventsIcon />,
      unlocked: counts.resume >= 1 && counts.interview >= 1 && counts.chatbot >= 1,
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Achievements
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {streak > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
              <LocalFireDepartmentIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                {streak}-day streak
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary">
            {unlockedCount}/{badges.length} unlocked
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {badges.map((badge) => (
          <Grid item xs={6} sm={4} md={2} key={badge.id}>
            <Tooltip title={badge.description}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: badge.unlocked ? 'primary.main' : 'divider',
                  opacity: badge.unlocked ? 1 : 0.4,
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: badge.unlocked ? 'translateY(-3px)' : 'none' },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: badge.unlocked ? 'primary.main' : 'action.disabledBackground',
                    color: badge.unlocked ? 'white' : 'text.disabled',
                    mb: 1,
                  }}
                >
                  {badge.icon}
                </Box>
                <Typography variant="caption" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                  {badge.label}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default AchievementsPanel;
