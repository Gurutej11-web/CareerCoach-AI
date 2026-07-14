import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const CtaSection: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 11 } }}>
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            backgroundImage: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 45%, #06B6D4 100%)',
            color: 'white',
            borderRadius: 4,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              filter: 'blur(6px)',
            }}
          />
          <AutoAwesomeIcon sx={{ fontSize: 36, mb: 2, opacity: 0.9 }} />
          <Typography component="h2" variant="h4" fontWeight={700} gutterBottom>
            Ready to supercharge your job search?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, opacity: 0.92 }}>
            Sign up today and start using AI-powered tools to land your next role.
          </Typography>
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            size="large"
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '17px',
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Get Started for Free
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default CtaSection;
