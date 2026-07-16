import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Chip, List, ListItem, ListItemText } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { getUserAnalyses } from '../../services/resumeService';
import { useAuth } from '../../contexts/AuthContext';

interface AnalysisHistoryItem {
  id: number;
  resume_title: string | null;
  job_description_title: string | null;
  match_score: number;
  created_at: string;
}

const AnalysisHistory: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    getUserAnalyses()
      .then((data) => setAnalyses(Array.isArray(data) ? data : data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated || loading) return null;
  if (analyses.length === 0) return null;

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <HistoryIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>Past Analyses</Typography>
      </Box>
      <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
        {analyses.slice(0, 10).map((analysis) => (
          <ListItem
            key={analysis.id}
            secondaryAction={
              <Chip
                label={`${analysis.match_score}%`}
                color={analysis.match_score > 70 ? 'success' : 'warning'}
                size="small"
              />
            }
          >
            <ListItemText
              primary={analysis.resume_title || 'Resume'}
              secondary={`vs. ${analysis.job_description_title || 'job description'} — ${new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AnalysisHistory;
