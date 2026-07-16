import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Checkbox, FormControlLabel,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;
const CHECKLIST_STORAGE_KEY = 'careercoach-interview-checklist';

const DEFAULT_CHECKLIST = [
  'Research the company and interviewers',
  'Review the job description and match your stories to it',
  'Practice with the Mock Interview tool',
  'Prepare 2-3 questions to ask them',
  'Plan your outfit and route/login details',
];

const InterviewCountdown: React.FC = () => {
  const [date, setDate] = useState<string | null>(null);
  const [label, setLabel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CHECKLIST_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE_URL}/profile/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setDate(res.data.profile.upcoming_interview_date);
        setLabel(res.data.profile.upcoming_interview_label);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleChecklistItem = (item: string) => {
    setChecked((prev) => {
      const next = { ...prev, [item]: !prev[item] };
      sessionStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const openDialog = () => {
    setDateInput(date || '');
    setLabelInput(label || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${API_BASE_URL}/profile/`,
        { profile: { upcoming_interview_date: dateInput || null, upcoming_interview_label: labelInput } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDate(dateInput || null);
      setLabel(labelInput);
      setDialogOpen(false);
    } catch {
      // Dialog stays open with entered values so the user can retry.
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  const daysLeft = date
    ? Math.ceil((new Date(date + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
    : null;

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Upcoming Interview</Typography>
        </Box>
        <IconButton size="small" onClick={openDialog} aria-label="Edit upcoming interview">
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      {daysLeft === null ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Add a real interview date to get a countdown and prep checklist.
          </Typography>
          <Button variant="outlined" onClick={openDialog}>Add interview date</Button>
        </Box>
      ) : (
        <>
          <Typography variant="h4" fontWeight={700} color={daysLeft <= 3 ? 'error.main' : 'primary.main'}>
            {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} to go` : daysLeft === 0 ? 'Today!' : 'Passed'}
          </Typography>
          {label && <Typography color="text.secondary" sx={{ mb: 2 }}>{label}</Typography>}

          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Prep checklist
          </Typography>
          {DEFAULT_CHECKLIST.map((item) => (
            <FormControlLabel
              key={item}
              control={<Checkbox checked={!!checked[item]} onChange={() => toggleChecklistItem(item)} size="small" />}
              label={<Typography variant="body2">{item}</Typography>}
              sx={{ display: 'flex' }}
            />
          ))}
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Upcoming interview</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320, pt: 1 }}>
          <TextField
            label="Interview date"
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Label (e.g. company / role)"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            helperText="Leave the date blank to remove the countdown"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InterviewCountdown;
