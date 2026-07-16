import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, Typography, Box, MobileStepper,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DashboardIcon from '@mui/icons-material/Dashboard';

const STORAGE_KEY = 'careercoach-onboarding-seen';

const STEPS = [
  {
    icon: <DashboardIcon sx={{ fontSize: 56 }} color="primary" />,
    title: 'Welcome to CareerCoach AI',
    body: "Here's a 30-second tour of what you can do. Your progress, scores, and history all follow your account — not this device.",
  },
  {
    icon: <DescriptionIcon sx={{ fontSize: 56 }} color="primary" />,
    title: 'Resume Tailoring',
    body: 'Upload your resume and a job description to get an AI match score, keyword suggestions, and a readability check.',
  },
  {
    icon: <MicIcon sx={{ fontSize: 56 }} color="primary" />,
    title: 'Mock Interviews',
    body: 'Practice out loud with role-specific questions and get feedback on pacing, clarity, and content — with a downloadable report.',
  },
  {
    icon: <ChatIcon sx={{ fontSize: 56 }} color="primary" />,
    title: 'Interview Chatbot',
    body: 'Ask anything about interview prep. Bookmark good answers and export your conversation as a study guide.',
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 56 }} color="primary" />,
    title: 'AI Career Tools',
    body: 'Salary negotiation scripts, cover letters, LinkedIn optimization, and more — all in one toolbox.',
  },
];

const OnboardingTour: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      setOpen(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <Dialog open={open} onClose={finish} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        <Box sx={{ mb: 2 }}>{STEPS[step].icon}</Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {STEPS[step].title}
        </Typography>
        <Typography color="text.secondary">{STEPS[step].body}</Typography>
      </DialogContent>
      <MobileStepper
        variant="dots"
        steps={STEPS.length}
        position="static"
        activeStep={step}
        sx={{ justifyContent: 'center', bgcolor: 'transparent' }}
        backButton={<span />}
        nextButton={<span />}
      />
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button onClick={finish} color="inherit">Skip</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {step > 0 && <Button onClick={() => setStep((s) => s - 1)}>Back</Button>}
          <Button
            variant="contained"
            onClick={() => (isLastStep ? finish() : setStep((s) => s + 1))}
          >
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingTour;
