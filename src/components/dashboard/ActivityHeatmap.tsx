import React, { useMemo } from 'react';
import { Paper, Typography, Box, Tooltip, useTheme, alpha, Skeleton } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useRecentActivity } from '../../contexts/RecentActivityContext';

const WEEKS = 12;
const DAYS_PER_WEEK = 7;

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const ActivityHeatmap: React.FC = () => {
  const { activities, isLoading } = useRecentActivity();
  const theme = useTheme();

  const { cells, totalDays } = useMemo(() => {
    const counts = new Map<string, number>();
    activities.forEach((a) => {
      const key = dayKey(new Date(a.timestamp));
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const totalCells = WEEKS * DAYS_PER_WEEK;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: { date: Date; count: number }[] = [];
    for (let i = totalCells - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d, count: counts.get(dayKey(d)) || 0 });
    }

    // Group into columns (weeks) of 7 so the grid reads Sun-Sat top-to-bottom.
    const weeks: { date: Date; count: number }[][] = [];
    for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
      weeks.push(days.slice(i, i + DAYS_PER_WEEK));
    }

    return { cells: weeks, totalDays: days.filter((d) => d.count > 0).length };
  }, [activities]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...cells.flat().map((c) => c.count));
  }, [cells]);

  const colorFor = (count: number) => {
    if (count === 0) return theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800];
    const intensity = Math.min(1, count / maxCount);
    return alpha(theme.palette.primary.main, 0.25 + intensity * 0.75);
  };

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Skeleton variant="text" width={140} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Activity
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {totalDays} active day{totalDays === 1 ? '' : 's'} in the last {WEEKS} weeks
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: '3px', overflowX: 'auto', pb: 1 }}>
        {cells.map((week, wi) => (
          <Box key={wi} sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map((day, di) => (
              <Tooltip
                key={di}
                title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${day.count} activit${day.count === 1 ? 'y' : 'ies'}`}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '3px',
                    backgroundColor: colorFor(day.count),
                    transition: 'transform 0.15s ease',
                    '&:hover': { transform: 'scale(1.3)' },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ActivityHeatmap;
