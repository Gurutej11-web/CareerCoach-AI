import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import logoMark from '../../assets/images/logo-mark.png';

interface LogoProps {
  iconSize?: number;
  fontSize?: number | string;
  color?: string;
  sx?: SxProps<Theme>;
}

const Logo: React.FC<LogoProps> = ({ iconSize = 28, fontSize = 22, color = 'inherit', sx }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      <Box
        component="img"
        src={logoMark}
        alt=""
        sx={{ width: iconSize, height: iconSize, borderRadius: '22%', flexShrink: 0 }}
      />
      <Typography
        component="span"
        sx={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 700,
          fontSize,
          color,
          lineHeight: 1,
        }}
      >
        CareerCoach AI
      </Typography>
    </Box>
  );
};

export default Logo;
