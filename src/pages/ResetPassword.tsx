import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Link, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Logo from '../components/common/Logo';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
import { extractApiErrorMessage } from '../utils/apiError';

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;

const ResetPassword: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/password-reset-confirm/`, {
        uid,
        token,
        new_password: password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(extractApiErrorMessage(err, 'This reset link is invalid or has expired.'));
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
            Choose a new password
          </Typography>
          {success ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your password has been reset. Redirecting you to login...
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <PasswordStrengthMeter password={password} />
                <TextField
                  fullWidth
                  label="Confirm new password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                />
                <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Reset password'}
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

export default ResetPassword;
