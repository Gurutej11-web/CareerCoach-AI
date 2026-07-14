import React from 'react';
import { Box, CircularProgress, Skeleton, Typography, Fade } from '@mui/material';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton';
  message?: string;
  skeletonRows?: number;
  minHeight?: number | string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  message = 'Loading...',
  skeletonRows = 3,
  minHeight = 160,
}) => {
  if (variant === 'skeleton') {
    return (
      <Fade in>
        <Box sx={{ width: '100%', py: 1 }}>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={i === 0 ? 40 : 24}
              sx={{ mb: 1.5, borderRadius: 2 }}
            />
          ))}
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          minHeight,
          width: '100%',
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

export default LoadingState;
