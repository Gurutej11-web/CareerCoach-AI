import React, { useEffect, useState } from 'react';
import { Alert, Button, Collapse } from '@mui/material';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;
const DISMISS_KEY = 'careercoach-verify-banner-dismissed';

const EmailVerificationBanner: React.FC = () => {
  const [needsVerification, setNeedsVerification] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === 'true');
  const [sending, setSending] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    axios
      .get(`${API_BASE_URL}/profile/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNeedsVerification(!res.data.profile.email_verified))
      .catch(() => {});
  }, []);

  const handleResend = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE_URL}/resend-verification/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      notify('Verification email sent — check your inbox.', 'success');
    } catch {
      notify('Failed to send verification email. Please try again later.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <Collapse in={needsVerification && !dismissed}>
      <Alert
        severity="info"
        onClose={handleDismiss}
        action={
          <Button color="inherit" size="small" onClick={handleResend} disabled={sending}>
            Resend email
          </Button>
        }
        sx={{ mb: 3 }}
      >
        Please verify your email address to secure your account.
      </Alert>
    </Collapse>
  );
};

export default EmailVerificationBanner;
