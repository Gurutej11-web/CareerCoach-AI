import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Logo from '../components/common/Logo';

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/password-reset/`, { email });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 440, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Logo />
          </Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
            Forgot your password?
          </Typography>
          {submitted ? (
            <>
              <Alert severity="success" sx={{ mt: 2 }}>
                If an account with that email exists, we've sent a link to reset your password.
              </Alert>
              <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                Didn't get it? Check your spam folder, or{' '}
                <Link component="button" onClick={() => setSubmitted(false)} underline="hover">
                  try a different email
                </Link>
                .
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                Enter the email on your account and we'll send you a link to reset your password.
              </Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  autoFocus
                />
                <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Send reset link'}
                </Button>
              </Box>
            </>
          )}
          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            <Link component={RouterLink} to="/login" underline="hover">
              Back to login
            </Link>
          </Typography>
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default ForgotPassword;
