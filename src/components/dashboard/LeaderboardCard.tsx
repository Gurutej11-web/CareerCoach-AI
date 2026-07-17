import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  best_score: number;
  is_you: boolean;
}

interface BenchmarkData {
  mock_interview: { your_average: number | null; platform_average: number | null };
  resume_match: { your_average: number | null; platform_average: number | null };
}

const LeaderboardCard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [optedIn, setOptedIn] = useState(true);
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/resume/leaderboard/`)
      .then((res) => {
        setEntries(res.data.entries);
        setOptedIn(res.data.you_opted_in);
      })
      .catch(() => {});
    axios
      .get<BenchmarkData>(`${API_BASE_URL}/api/resume/benchmark/`)
      .then((res) => setBenchmark(res.data))
      .catch(() => {});
  }, []);

  const hasBenchmark =
    benchmark && (benchmark.mock_interview.your_average !== null || benchmark.resume_match.your_average !== null);

  if (entries.length === 0 && !hasBenchmark) return null;

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        How You Compare
      </Typography>

      {hasBenchmark && (
        <Grid container spacing={2} sx={{ mb: entries.length > 0 ? 3 : 0 }}>
          {benchmark!.mock_interview.your_average !== null && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Mock interview average</Typography>
              <Typography variant="h5" fontWeight="bold">
                {benchmark!.mock_interview.your_average}
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}vs platform avg {benchmark!.mock_interview.platform_average ?? '—'}
                </Typography>
              </Typography>
            </Grid>
          )}
          {benchmark!.resume_match.your_average !== null && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Resume match average</Typography>
              <Typography variant="h5" fontWeight="bold">
                {benchmark!.resume_match.your_average}%
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}vs platform avg {benchmark!.resume_match.platform_average ?? '—'}%
                </Typography>
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {entries.length > 0 && (
        <>
          {hasBenchmark && <Divider sx={{ mb: 2 }} />}
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Leaderboard (anonymized, opt-in)
          </Typography>
          <List dense>
            {entries.map((entry) => (
              <ListItem
                key={entry.rank}
                sx={{ bgcolor: entry.is_you ? 'action.selected' : 'transparent', borderRadius: 1 }}
              >
                <ListItemText primary={`#${entry.rank} ${entry.display_name}${entry.is_you ? ' (you)' : ''}`} />
                <Chip label={entry.best_score} size="small" color="primary" />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {!optedIn && (
        <Typography variant="caption" color="text.secondary">
          Want to appear on the leaderboard?{' '}
          <MuiLink component={RouterLink} to="/profile">Opt in from your profile.</MuiLink>
        </Typography>
      )}
    </Paper>
  );
};

export default LeaderboardCard;
