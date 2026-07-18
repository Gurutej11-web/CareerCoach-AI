import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton, Stack, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import Logo from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';

const loggedOutProductLinks = [
  { label: 'Resume Tailoring', to: '/login' },
  { label: 'Mock Interviews', to: '/login' },
  { label: 'Chatbot', to: '/login' },
];

const loggedInProductLinks = [
  { label: 'Resume Tailoring', to: '/resume' },
  { label: 'Mock Interviews', to: '/mock-interview' },
  { label: 'Chatbot', to: '/chat' },
];

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Box
      component="footer"
      sx={{
        pt: 6,
        pb: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={5}>
            <Logo iconSize={28} fontSize={20} color="text.primary" sx={{ mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
              Your AI-powered job application companion — resume feedback, mock interviews,
              and coaching in one place.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton
                component="a"
                href="https://github.com/Gurutej11-web/CareerCoach-AI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'transform 0.2s ease, color 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', color: 'primary.main' },
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ fontWeight: 700 }}>
              Product
            </Typography>
            <Stack spacing={1}>
              {(isAuthenticated ? loggedInProductLinks : loggedOutProductLinks).map((link) => (
                <Link
                  key={link.label}
                  component={RouterLink}
                  to={link.to}
                  variant="body2"
                  color="text.secondary"
                  underline="hover"
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ fontWeight: 700 }}>
              Company
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/" variant="body2" color="text.secondary" underline="hover">
                Home
              </Link>
              <Link component={RouterLink} to="/dashboard" variant="body2" color="text.secondary" underline="hover">
                Dashboard
              </Link>
              <Link component={RouterLink} to="/terms" variant="body2" color="text.secondary" underline="hover">
                Terms of Service
              </Link>
              <Link component={RouterLink} to="/privacy" variant="body2" color="text.secondary" underline="hover">
                Privacy Policy
              </Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} CareerCoach AI. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
