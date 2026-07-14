import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import Logo from '../common/Logo';

const navLinks = [
  { label: 'Resume Tailoring', to: '/login' },
  { label: 'Mock Interviews', to: '/login' },
  { label: 'Chatbot', to: '/login' },
];

const Header: React.FC = () => {
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={scrolled ? 4 : 0}
        sx={{
          backgroundColor: scrolled
            ? theme.palette.mode === 'light'
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(15,23,42,0.9)'
            : theme.palette.primary.main,
          color: scrolled ? 'text.primary' : 'primary.contrastText',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        <Toolbar>
          <Box
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            <Logo iconSize={30} fontSize={22} />
          </Box>

          {isMobile ? (
            <>
              <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <IconButton
                  onClick={toggleMode}
                  color="inherit"
                  aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                </IconButton>
              </Tooltip>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navLinks.map((link) => (
                <Button key={link.label} color="inherit" component={RouterLink} to={link.to}>
                  {link.label}
                </Button>
              ))}
              <Button variant="contained" color="secondary" component={RouterLink} to="/login">
                Login/Sign Up
              </Button>
              <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <IconButton
                  onClick={toggleMode}
                  color="inherit"
                  sx={{ ml: 1 }}
                  aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <Box sx={{ p: 2 }}>
            <Logo iconSize={26} fontSize={18} color="text.primary" />
          </Box>
          <Divider />
          <List>
            {navLinks.map((link) => (
              <ListItemButton key={link.label} component={RouterLink} to={link.to}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            <ListItemButton component={RouterLink} to="/login">
              <ListItemText primary="Login/Sign Up" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
