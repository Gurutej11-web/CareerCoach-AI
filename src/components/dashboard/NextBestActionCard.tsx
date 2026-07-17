import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface NextBestAction {
  title: string;
  description: string;
  cta_label: string;
  cta_path: string;
}

const NextBestActionCard: React.FC = () => {
  const [action, setAction] = useState<NextBestAction | null>(null);

  useEffect(() => {
    axios
      .get<NextBestAction>(`${API_BASE_URL}/api/resume/next-best-action/`)
      .then((res) => setAction(res.data))
      .catch(() => {});
  }, []);

  if (!action) return null;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mt: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(79,70,229,0.25), rgba(6,182,212,0.15))'
            : 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(6,182,212,0.06))',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <LightbulbIcon color="primary" sx={{ fontSize: 32, mt: 0.5 }} />
        <Box>
          <Typography variant="overline" color="text.secondary">Next best action</Typography>
          <Typography variant="h6" fontWeight="bold">{action.title}</Typography>
          <Typography variant="body2" color="text.secondary">{action.description}</Typography>
        </Box>
      </Box>
      <Button
        component={RouterLink}
        to={action.cta_path}
        variant="contained"
        endIcon={<ArrowForwardIcon />}
      >
        {action.cta_label}
      </Button>
    </Paper>
  );
};

export default NextBestActionCard;
