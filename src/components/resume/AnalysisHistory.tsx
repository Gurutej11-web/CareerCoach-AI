import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Chip, List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import { getUserAnalyses, downloadTailoredResume } from '../../services/resumeService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface AnalysisHistoryItem {
  id: number;
  resume_title: string | null;
  job_description_title: string | null;
  match_score: number;
  created_at: string;
}

const AnalysisHistory: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { notify } = useNotification();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    try {
      await downloadTailoredResume(id);
      notify('Tailored resume downloaded', 'success');
    } catch (err) {
      console.error('Error downloading tailored resume:', err);
      notify('Failed to download tailored resume. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${analysis.match_score}%`}
                  color={analysis.match_score > 70 ? 'success' : 'warning'}
                  size="small"
                />
                <Tooltip title="Download tailored resume (.docx)">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(analysis.id)}
                      disabled={downloadingId === analysis.id}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
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
