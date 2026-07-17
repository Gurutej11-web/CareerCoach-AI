import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { getUserInterviews, getQuestionScoreTrend, MockInterview, QuestionScoreTrend } from '../../services/interviewService';
import { formatDistanceToNow } from 'date-fns';
import LoadingState from '../common/LoadingState';

const InterviewHistory: React.FC = () => {
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<QuestionScoreTrend[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const data = await getUserInterviews();
        setInterviews(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching interview history:', err);
        setError('Failed to load interview history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
    getQuestionScoreTrend().then(setTrends);
  }, []);

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Interview History</Typography>
        <LoadingState variant="skeleton" skeletonRows={4} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'error.light' }}>
        <Typography variant="body1" color="error.dark">
          {error}
        </Typography>
      </Paper>
    );
  }

  if (interviews.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          No Interview History
        </Typography>
        <Typography variant="body1">
          You haven't completed any mock interviews yet. Try recording a new interview to get feedback.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Interview History
      </Typography>

      {trends.length > 0 && (
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Score Trend on Repeated Questions
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {trends.map((trend) => (
                <Box key={trend.question_text}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    {trend.question_text}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {trend.attempts.map((attempt, i) => (
                      <React.Fragment key={attempt.id}>
                        {i > 0 && <Typography variant="body2" color="text.secondary">→</Typography>}
                        <Chip
                          label={`${attempt.score}`}
                          size="small"
                          color={getScoreColor(attempt.score)}
                        />
                      </React.Fragment>
                    ))}
                    {trend.attempts[trend.attempts.length - 1].score > trend.attempts[0].score && (
                      <Chip label="Improving" size="small" color="success" variant="outlined" sx={{ ml: 1 }} />
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      <List sx={{ width: '100%' }}>
        {interviews.map((interview, index) => (
          <React.Fragment key={interview.id}>
            {index > 0 && <Divider component="li" />}
            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <ListItemText
                    primary={interview.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {interview.job_description ? `For: ${interview.job_description.title}` : 'No job description'}
                        </Typography>
                        <br />
                        {formatDate(interview.created_at)}
                        <br />
                        {`Duration: ${Math.round(interview.duration / 60)} minutes`}
                      </>
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 0.5 }}>
                  <Chip
                    label={`Score: ${interview.overall_score}%`}
                    color={getScoreColor(interview.overall_score)}
                    sx={{ fontWeight: 'bold' }}
                  />
                  {interview.difficulty && (
                    <Chip label={interview.difficulty} size="small" variant="outlined" />
                  )}
                </Grid>
              </Grid>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default InterviewHistory; 