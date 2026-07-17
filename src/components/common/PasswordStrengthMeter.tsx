import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { estimatePasswordStrength } from '../../utils/passwordStrength';

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;
  const strength = estimatePasswordStrength(password);

  return (
    <Box sx={{ mt: -1, mb: 2 }}>
      <LinearProgress
        variant="determinate"
        value={(strength.score / 4) * 100}
        color={strength.color}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <Typography variant="caption" color={`${strength.color}.main`}>
        {strength.label}
      </Typography>
    </Box>
  );
};

export default PasswordStrengthMeter;
