import React, { useEffect, useState } from 'react';
import { Box, Paper, Alert, CircularProgress, Button } from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Logo from '../components/common/Logo';
import { extractApiErrorMessage } from '../utils/apiError';

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;

const VerifyEmail: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios
      .post(`${API_BASE_URL}/verify-email/`, { uid, token })
      .then((res) => {
        setStatus('success');
        setMessage(res.data.detail);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(extractApiErrorMessage(err, 'This verification link is invalid or has expired.'));
      });
  }, [uid, token]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Logo />
          </Box>
          {status === 'loading' && <CircularProgress />}
          {status === 'success' && <Alert severity="success">{message}</Alert>}
          {status === 'error' && <Alert severity="error">{message}</Alert>}
          <Button component={RouterLink} to="/dashboard" variant="contained" sx={{ mt: 3 }}>
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default VerifyEmail;
