import React, { useEffect, useMemo, useState } from 'react';
import {
  Paper, Typography, Box, LinearProgress, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useRecentActivity } from '../../contexts/RecentActivityContext';

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/users/api`;

const GoalsCard: React.FC = () => {
  const { activities } = useRecentActivity();
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [targetInterviews, setTargetInterviews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scoreInput, setScoreInput] = useState('');
  const [interviewsInput, setInterviewsInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE_URL}/profile/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setTargetScore(res.data.profile.goal_target_score);
        setTargetInterviews(res.data.profile.goal_target_interviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const progress = useMemo(() => {
    const scored = activities.filter((a) => typeof a.score === 'number');
    const bestScore = scored.length ? Math.max(...scored.map((a) => a.score as number)) : 0;
    const interviewCount = activities.filter((a) => a.type === 'interview').length;
    return { bestScore, interviewCount };
  }, [activities]);

  const openDialog = () => {
    setScoreInput(targetScore !== null ? String(targetScore) : '');
    setInterviewsInput(targetInterviews !== null ? String(targetInterviews) : '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const newScore = scoreInput ? Number(scoreInput) : null;
      const newInterviews = interviewsInput ? Number(interviewsInput) : null;
      await axios.put(
        `${API_BASE_URL}/profile/`,
        { profile: { goal_target_score: newScore, goal_target_interviews: newInterviews } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTargetScore(newScore);
      setTargetInterviews(newInterviews);
      setDialogOpen(false);
    } catch {
      // Silently ignore — the dialog stays open with the entered values so the user can retry.
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  const hasGoals = targetScore !== null || targetInterviews !== null;

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlagIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Goals</Typography>
        </Box>
        <IconButton size="small" onClick={openDialog} aria-label="Edit goals">
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      {!hasGoals ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Set a target score or interview count to track your progress here.
          </Typography>
          <Button variant="outlined" onClick={openDialog}>Set a goal</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {targetScore !== null && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Target score</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {progress.bestScore} / {targetScore}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (progress.bestScore / targetScore) * 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
          {targetInterviews !== null && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Mock interviews this month</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {progress.interviewCount} / {targetInterviews}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (progress.interviewCount / targetInterviews) * 100)}
                color="secondary"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Set your goals</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320, pt: 1 }}>
          <TextField
            label="Target resume/interview score"
            type="number"
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            inputProps={{ min: 0, max: 100 }}
            helperText="Leave blank to remove this goal"
          />
          <TextField
            label="Target number of mock interviews"
            type="number"
            value={interviewsInput}
            onChange={(e) => setInterviewsInput(e.target.value)}
            inputProps={{ min: 0 }}
            helperText="Leave blank to remove this goal"
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

export default GoalsCard;
