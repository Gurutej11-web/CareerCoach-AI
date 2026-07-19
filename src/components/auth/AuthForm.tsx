import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Logo from '../common/Logo';
import PasswordStrengthMeter from '../common/PasswordStrengthMeter';
import { extractApiErrorMessage } from '../../utils/apiError';

// Define API base URL
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

const AuthForm: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useNotification();

  // Form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    job_title: '',
    company: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!isLogin) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Enter a valid email address';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin && formData.password_confirm !== formData.password) {
      errors.password_confirm = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const attemptAuthRequest = async () => {
    if (isLogin) {
      const response = await api.post('/login/', {
        username: formData.username,
        password: formData.password,
      });
      login(response.data.access, response.data.refresh, { username: formData.username });
      notify(`Welcome back, ${formData.username}!`, 'success');
      navigate('/dashboard');
    } else {
      const response = await api.post('/register/', formData);
      login(response.data.access, response.data.refresh, response.data.user);
      notify('Account created successfully!', 'success');
      navigate('/dashboard');
    }
  };

  // No `err.response` means the request never got a reply at all — most
  // often the backend is a cold-starting free-tier instance (can take
  // 30-60s to wake up), not an actual auth rejection. Retry with a couple
  // of staged waits instead of immediately showing an unhelpful "try again"
  // the user has no way to act on. Waits are deliberately uneven (8s, 20s)
  // so most cold starts are caught by the second attempt without making
  // someone with a real network problem sit through a full minute silently.
  const RETRY_DELAYS_MS = [8000, 20000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRetryStatus(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    let lastErr: any;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        await attemptAuthRequest();
        setRetryStatus(null);
        setLoading(false);
        return;
      } catch (err: any) {
        lastErr = err;
        if (err.response) break; // a real response means retrying won't help
        if (attempt < RETRY_DELAYS_MS.length) {
          console.warn(`Auth request got no response (attempt ${attempt + 1}), retrying — likely a cold-starting backend:`, err);
          setRetryStatus(`The server is waking up — retrying in ${RETRY_DELAYS_MS[attempt] / 1000}s…`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
        }
      }
    }

    setRetryStatus(null);
    console.error('Authentication error:', lastErr);
    const errorMessage = lastErr.response
      ? extractApiErrorMessage(lastErr, 'Authentication failed. Please try again.')
      : "Couldn't reach the server after a few tries. It may still be starting up — please try again in a moment.";
    setError(errorMessage);
    notify(errorMessage, 'error');
    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)', // Subtract header height
        bgcolor: 'grey.100',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: 1000,
          minHeight: 600,
          margin: 'auto',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Left side - brand and feature highlights */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            p: 5,
            background: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 45%, #06B6D4 100%)',
            color: 'white',
          }}
        >
          <Logo iconSize={36} fontSize={26} color="white" sx={{ mb: 4 }} />

          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ lineHeight: 1.25 }}>
            Your AI-powered job application companion
          </Typography>
          <Typography sx={{ mb: 4, opacity: 0.9 }}>
            Everything you need to prepare for your next role, in one place.
          </Typography>

          <Stack spacing={2}>
            {[
              'AI resume analysis & keyword matching',
              'Realistic mock interviews with instant feedback',
              '24/7 AI interview-prep chatbot',
            ].map((feature) => (
              <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                <Typography variant="body2">{feature}</Typography>
              </Box>
            ))}
          </Stack>

          <Typography variant="body2" sx={{ mt: 5, opacity: 0.8 }}>
            Free to get started — no credit card required.
          </Typography>
        </Box>

        {/* Right side - form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 4,
            overflowY: 'auto',
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            {isLogin ? 'Login to Your Account' : 'Create an Account'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {retryStatus && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {retryStatus}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              variant="outlined"
              margin="normal"
              required
              sx={{ mb: 2 }}
              value={formData.username}
              onChange={handleChange}
              error={Boolean(fieldErrors.username)}
              helperText={fieldErrors.username}
            />

            {!isLogin && (
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                variant="outlined"
                type="email"
                margin="normal"
                required
                sx={{ mb: 2 }}
                value={formData.email}
                onChange={handleChange}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
              />
            )}

            {!isLogin && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    variant="outlined"
                    margin="normal"
                    sx={{ mb: 2 }}
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    variant="outlined"
                    margin="normal"
                    sx={{ mb: 2 }}
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            )}
            
            {!isLogin && (
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                variant="outlined"
                margin="normal"
                sx={{ mb: 2 }}
                value={formData.phone_number}
                onChange={handleChange}
              />
            )}
            
            {!isLogin && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="job_title"
                    variant="outlined"
                    margin="normal"
                    sx={{ mb: 2 }}
                    value={formData.job_title}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    variant="outlined"
                    margin="normal"
                    sx={{ mb: 2 }}
                    value={formData.company}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            )}

            <TextField
              fullWidth
              label="Password"
              name="password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              required
              sx={{ mb: 2 }}
              value={formData.password}
              onChange={handleChange}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {!isLogin && <PasswordStrengthMeter password={formData.password} />}

            {!isLogin && (
              <TextField
                fullWidth
                label="Confirm Password"
                name="password_confirm"
                variant="outlined"
                type={showConfirmPassword ? 'text' : 'password'}
                margin="normal"
                required
                sx={{ mb: 2 }}
                value={formData.password_confirm}
                onChange={handleChange}
                error={Boolean(fieldErrors.password_confirm)}
                helperText={fieldErrors.password_confirm}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {isLogin && (
              <Box sx={{ textAlign: 'right', mb: 2 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot Password?
                </Link>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              sx={{ mt: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : isLogin ? 'Login' : 'Sign Up'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={toggleForm}
                  sx={{ fontWeight: 'bold' }}
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthForm; 