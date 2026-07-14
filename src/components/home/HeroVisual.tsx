import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress, Stack, Avatar } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import MicIcon from '@mui/icons-material/Mic';
import logoMark from '../../assets/images/logo-mark.png';

const HeroVisual: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 480,
        margin: 'auto',
        py: { xs: 4, md: 0 },
      }}
    >
      {/* Base "app preview" panel */}
      <Paper
        elevation={12}
        sx={{
          borderRadius: 4,
          p: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 30px 70px rgba(0,0,0,0.35)',
        }}
      >
        <Stack direction="row" spacing={0.75} sx={{ mb: 2.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F87171' }} />
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FBBF24' }} />
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#34D399' }} />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Resume Match Score
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="h3" fontWeight={800} color="primary.main" lineHeight={1}>
            94%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            match with job description
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={94}
          sx={{ height: 8, borderRadius: 4, mb: 2.5 }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {['leadership', 'react', 'AI/ML', '+3 more'].map((tag) => (
            <Chip key={tag} label={tag} size="small" color={tag.startsWith('+') ? 'default' : 'secondary'} />
          ))}
        </Stack>
      </Paper>

      {/* Floating chatbot card */}
      <Paper
        elevation={10}
        sx={{
          position: 'absolute',
          top: { xs: -20, md: -28 },
          right: { xs: 8, md: -24 },
          width: { xs: 190, md: 220 },
          p: 1.75,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
        }}
      >
        <Avatar src={logoMark} sx={{ width: 28, height: 28 }} />
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
            Interview Chatbot
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ fontSize: 13, lineHeight: 1.3 }}>
            "Use the STAR method to structure your answer..."
          </Typography>
        </Box>
      </Paper>

      {/* Floating mock-interview score card */}
      <Paper
        elevation={10}
        sx={{
          position: 'absolute',
          bottom: { xs: -20, md: -24 },
          left: { xs: 8, md: -28 },
          px: 2,
          py: 1.25,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'secondary.main',
            color: 'white',
          }}
        >
          <MicIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
            Mock Interview
          </Typography>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            Score: 88 / 100
          </Typography>
        </Box>
      </Paper>

      {/* Small chip badge */}
      <Chip
        icon={<ChatIcon sx={{ fontSize: 16 }} />}
        label="Live AI feedback"
        size="small"
        sx={{
          position: 'absolute',
          top: { xs: '42%', md: '46%' },
          right: { xs: -6, md: -34 },
          bgcolor: 'background.paper',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          fontWeight: 600,
        }}
      />
    </Box>
  );
};

export default HeroVisual;
