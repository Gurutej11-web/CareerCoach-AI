import React from 'react';
import { Box, Container, Typography, Button, Grid, Chip, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HeroVisual from './HeroVisual';

const trustBadges = ['Powered by LLaMA 3', 'Azure Cognitive Services', 'BERT-based analysis'];

const HeroSection: React.FC = () => {
  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 10, md: 14 },
        pb: { xs: 10, md: 12 },
        backgroundImage: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 45%, #06B6D4 100%)',
        color: 'white',
      }}
    >
      {/* Decorative background blobs */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -120,
          right: -100,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(10px)',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -140,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          filter: 'blur(10px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ color: 'white !important' }} />}
              label="AI-Powered Career Coaching"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 600,
                mb: 3,
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
            <Typography
              component="h1"
              variant="h2"
              align="left"
              color="inherit"
              gutterBottom
              sx={{ fontWeight: 700, lineHeight: 1.15 }}
            >
              Land your next job with an AI career coach in your corner
            </Typography>
            <Typography
              variant="h6"
              align="left"
              color="inherit"
              sx={{ mb: 4, opacity: 0.92, fontWeight: 400 }}
            >
              Tailor your resume, practice interviews, and get personalized AI feedback —
              the kind of coaching that used to require an expensive career coach or a big network.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontSize: '18px',
                  px: 4,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Get Started Free
              </Button>
              <Button
                href="#features"
                onClick={scrollToFeatures}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: 'white',
                  fontSize: '18px',
                  px: 4,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                See Features
              </Button>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 5, flexWrap: 'wrap', rowGap: 1 }}>
              {trustBadges.map((badge) => (
                <Chip
                  key={badge}
                  label={badge}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.4)',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <HeroVisual />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
