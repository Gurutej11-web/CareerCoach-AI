import React, { useEffect, useState } from 'react';
import {
  Typography, Divider, Box, Button, List, ListItem, ListItemText, CircularProgress, Alert,
} from '@mui/material';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;

interface Session {
  id: number;
  created_at: string;
  expires_at: string;
}

const ActiveSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const { notify } = useNotification();

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Session[]>(`${API_BASE_URL}/sessions/`, authHeaders());
      setSessions(res.data);
    } catch {
      // Leave the list empty — this is a convenience view, not critical functionality.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevoke = async (id: number) => {
    setRevokingId(id);
    try {
      await axios.post(`${API_BASE_URL}/sessions/revoke/`, { id }, authHeaders());
      setSessions((prev) => prev.filter((s) => s.id !== id));
      notify('Session revoked', 'success');
    } catch {
      notify('Failed to revoke session', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      await axios.post(`${API_BASE_URL}/sessions/revoke-all/`, {}, authHeaders());
      notify('Logged out of all other sessions', 'success');
      loadSessions();
    } catch {
      notify('Failed to revoke sessions', 'error');
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
        Active Sessions
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        These are the devices/browsers currently signed in to your account. Revoke any you don't recognize.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : sessions.length === 0 ? (
        <Alert severity="info">No active sessions found.</Alert>
      ) : (
        <List>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              secondaryAction={
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRevoke(session.id)}
                  disabled={revokingId === session.id}
                >
                  {revokingId === session.id ? <CircularProgress size={18} /> : 'Revoke'}
                </Button>
              }
            >
              <ListItemText
                primary={`Signed in ${new Date(session.created_at).toLocaleString()}`}
                secondary={`Expires ${new Date(session.expires_at).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {sessions.length > 1 && (
        <Button variant="outlined" color="error" onClick={handleRevokeAll} disabled={revokingAll} sx={{ mt: 1 }}>
          {revokingAll ? <CircularProgress size={20} /> : 'Log out of all other sessions'}
        </Button>
      )}
    </>
  );
};

export default ActiveSessions;
