import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={4} sx={{ ml: 12 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              CareerCoach AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your AI-powered job application companion
            </Typography>
          </Grid>
        </Grid>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} CareerCoach AI. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 