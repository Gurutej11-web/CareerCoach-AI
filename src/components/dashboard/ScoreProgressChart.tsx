import React, { useMemo } from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { useRecentActivity } from '../../contexts/RecentActivityContext';

const CHART_WIDTH = 600;
const CHART_HEIGHT = 180;
const PADDING = 24;

const ScoreProgressChart: React.FC = () => {
  const { activities } = useRecentActivity();
  const theme = useTheme();

  const points = useMemo(() => {
    return activities
      .filter((a) => typeof a.score === 'number')
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-10);
  }, [activities]);

  const path = useMemo(() => {
    if (points.length < 2) return { line: '', area: '', coords: [] as { x: number; y: number; score: number }[] };

    const usableWidth = CHART_WIDTH - PADDING * 2;
    const usableHeight = CHART_HEIGHT - PADDING * 2;
    const step = usableWidth / (points.length - 1);

    const coords = points.map((p, i) => {
      const score = Math.max(0, Math.min(100, p.score as number));
      const x = PADDING + i * step;
      const y = PADDING + usableHeight - (score / 100) * usableHeight;
      return { x, y, score };
    });

    const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const area = `${line} L ${coords[coords.length - 1].x} ${CHART_HEIGHT - PADDING} L ${coords[0].x} ${CHART_HEIGHT - PADDING} Z`;

    return { line, area, coords };
  }, [points]);

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ShowChartIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>
          Score Progress
        </Typography>
      </Box>

      {points.length < 2 ? (
        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            Complete a couple of resume analyses or mock interviews to see your score trend here.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            width="100%"
            height={CHART_HEIGHT}
            role="img"
            aria-label="Line chart of your recent resume and interview scores over time"
          >
            <defs>
              <linearGradient id="scoreAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.25} />
                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={path.area} fill="url(#scoreAreaFill)" stroke="none" />
            <path d={path.line} fill="none" stroke={theme.palette.primary.main} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            {path.coords.map((c, i) => (
              <circle key={i} cx={c.x} cy={c.y} r={5} fill={theme.palette.primary.main}>
                <title>{`${points[i].description}: ${c.score}`}</title>
              </circle>
            ))}
          </svg>
        </Box>
      )}
    </Paper>
  );
};

export default ScoreProgressChart;
