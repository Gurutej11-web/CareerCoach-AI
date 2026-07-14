import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../../contexts/ThemeModeContext';

const Header: React.FC = () => {
  const { mode, toggleMode } = useThemeMode();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontFamily: '"Poppins", sans-serif',
            fontSize: '24px',
          }}
        >
          CareerCoach AI
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button color="inherit" component={RouterLink} to="/login">
            Resume Tailoring
          </Button>
          <Button color="inherit" component={RouterLink} to="/login">
            Mock Interviews
          </Button>
          <Button color="inherit" component={RouterLink} to="/login">
            Chatbot
          </Button>
          <Button variant="contained" color="secondary" component={RouterLink} to="/login">
            Login/Sign Up
          </Button>
          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton onClick={toggleMode} color="inherit" sx={{ ml: 1 }}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
