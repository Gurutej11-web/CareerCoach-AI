import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getSharedInterview, SharedInterview as SharedInterviewData } from '../services/interviewService';

const SharedInterview: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedInterviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getSharedInterview(token)
      .then(setData)
      .catch(() => setError('This share link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 6 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Alert severity="error" sx={{ mb: 3, display: 'inline-flex' }}>{error}</Alert>
            <Box>
              <Button component={RouterLink} to="/" variant="contained">Back to Home</Button>
            </Box>
          </Box>
        )}
        {data && (
          <Paper elevation={2} sx={{ p: 4 }}>
            <Typography variant="overline" color="text.secondary">Shared Mock Interview Feedback</Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>{data.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip label={`Score: ${data.overall_score}/100`} color={data.overall_score >= 70 ? 'success' : 'warning'} />
              {data.difficulty && <Chip label={data.difficulty} variant="outlined" />}
            </Box>
            {data.question_text && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Question</Typography>
                <Typography paragraph color="text.secondary">{data.question_text}</Typography>
              </>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Transcript</Typography>
            <Typography paragraph sx={{ whiteSpace: 'pre-wrap' }} color="text.secondary">
              {data.transcript}
            </Typography>
            {data.feedback && Object.keys(data.feedback).length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Feedback</Typography>
                <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: 'text.secondary' }}>
                  {JSON.stringify(data.feedback, null, 2)}
                </Box>
              </>
            )}
          </Paper>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default SharedInterview;
