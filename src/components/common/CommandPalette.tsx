import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ContrastIcon from '@mui/icons-material/Contrast';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../contexts/ThemeModeContext';

interface CommandItem {
  label: string;
  keywords: string;
  icon: React.ReactNode;
  action: () => void;
}

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { toggleMode, toggleHighContrast, highContrast } = useThemeMode();

  // Single-letter quick-jump shortcuts (GitHub/Gmail-style), only active when
  // the command palette is closed and focus isn't in a text field — so
  // typing "d" in a resume textarea never gets mistaken for a navigation command.
  const quickJumpRoutes: Record<string, string> = useMemo(
    () => ({ d: '/dashboard', r: '/resume', i: '/mock-interview', c: '/chat', a: '/ai-tools' }),
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isModK) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (open || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable;
      if (isTyping) return;

      const route = quickJumpRoutes[e.key.toLowerCase()];
      if (route) {
        navigate(route);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, navigate, quickJumpRoutes]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const items: CommandItem[] = useMemo(
    () => [
      { label: 'Home', keywords: 'home landing', icon: <HomeIcon />, action: () => navigate('/') },
      { label: 'Dashboard', keywords: 'dashboard overview stats', icon: <DashboardIcon />, action: () => navigate('/dashboard') },
      { label: 'Resume Tailoring', keywords: 'resume upload analyze tailor', icon: <DescriptionIcon />, action: () => navigate('/resume') },
      { label: 'Mock Interview', keywords: 'mock interview practice record', icon: <MicIcon />, action: () => navigate('/mock-interview') },
      { label: 'Interview Chatbot', keywords: 'chatbot chat ai groq llama', icon: <ChatIcon />, action: () => navigate('/chat') },
      { label: 'AI Tools', keywords: 'ai tools salary linkedin negotiation', icon: <AutoAwesomeIcon />, action: () => navigate('/ai-tools') },
      { label: 'Profile', keywords: 'profile account settings', icon: <PersonIcon />, action: () => navigate('/profile') },
      { label: 'Login / Sign Up', keywords: 'login signup auth register', icon: <LoginIcon />, action: () => navigate('/login') },
      { label: 'Toggle Dark Mode', keywords: 'dark light theme mode toggle', icon: <Brightness4Icon />, action: toggleMode },
      {
        label: highContrast ? 'Turn Off High-Contrast Mode' : 'Turn On High-Contrast Mode',
        keywords: 'high contrast accessibility colorblind visibility',
        icon: <ContrastIcon />,
        action: toggleHighContrast,
      },
    ],
    [navigate, toggleMode, toggleHighContrast, highContrast]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.keywords.includes(q)
    );
  }, [items, query]);

  const handleSelect = (item: CommandItem) => {
    item.action();
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Search pages and actions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ px: 1, py: 0.5 }}
        />
      </Box>
      <List sx={{ maxHeight: 360, overflowY: 'auto', py: 1 }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No matches found</Typography>
          </Box>
        ) : (
          filtered.map((item) => (
            <ListItemButton key={item.label} onClick={() => handleSelect(item)}>
              <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))
        )}
      </List>
      <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">
          Press Esc to close · ⌘K / Ctrl+K to toggle · Outside a text field: D/R/I/C/A jump to Dashboard/Resume/Interview/Chat/AI Tools
        </Typography>
      </Box>
    </Dialog>
  );
};

export default CommandPalette;
