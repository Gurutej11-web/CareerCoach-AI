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
  Stack,
  Grid,
} from '@mui/material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getPublicPortfolio, PublicPortfolio as PublicPortfolioData } from '../services/profileService';

const PublicPortfolio: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicPortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getPublicPortfolio(slug)
      .then(setData)
      .catch(() => setError('This portfolio does not exist or is not public.'))
      .finally(() => setLoading(false));
  }, [slug]);

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
            <Typography variant="h4" fontWeight="bold" gutterBottom>{data.display_name}</Typography>
            {data.job_title && (
              <Typography variant="h6" color="text.secondary" gutterBottom>{data.job_title}</Typography>
            )}
            {data.location && (
              <Typography variant="body2" color="text.secondary" gutterBottom>{data.location}</Typography>
            )}

            {data.bio && <Typography paragraph sx={{ mt: 2 }}>{data.bio}</Typography>}

            {data.target_role && (
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Targeting:</strong> {data.target_role}
              </Typography>
            )}
            {data.career_goal && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Career goal:</strong> {data.career_goal}
              </Typography>
            )}

            {data.skills.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                {data.skills.map((skill) => (
                  <Chip key={skill} label={skill} size="small" />
                ))}
              </Stack>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold">{data.stats.mock_interviews_completed}</Typography>
                  <Typography variant="body2" color="text.secondary">Mock interviews completed</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight="bold">
                    {data.stats.best_resume_match_score !== null ? `${data.stats.best_resume_match_score}%` : '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Best resume match score</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default PublicPortfolio;
