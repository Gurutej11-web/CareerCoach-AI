import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import Reveal from '../common/Reveal';

const features = [
  {
    title: 'Resume Tailoring',
    description:
      'Upload your resume and a job description to get AI-powered keyword matching and suggestions for optimizing your resume.',
    icon: <DescriptionIcon sx={{ fontSize: 30 }} />,
  },
  {
    title: 'Mock Interviews',
    description:
      'Practice interviews with our AI interviewer and get real-time feedback on your responses.',
    icon: <MicIcon sx={{ fontSize: 30 }} />,
  },
  {
    title: 'Interview Prep Chatbot',
    description:
      'Get personalized tips and answers to common interview questions, any time, through our AI chatbot.',
    icon: <ChatIcon sx={{ fontSize: 30 }} />,
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <Box id="features" sx={{ py: { xs: 8, md: 11 }, bgcolor: 'background.default', scrollMarginTop: '80px' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: { xs: 6, md: 8 } }}>
          <Chip
            label="FEATURES"
            size="small"
            color="secondary"
            sx={{ fontWeight: 700, letterSpacing: 1, mb: 2 }}
          />
          <Typography component="h2" variant="h3" fontWeight={700} gutterBottom>
            Everything you need to land the job
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            One AI-powered toolkit for every stage of your job search.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} md={4}>
              <Reveal delay={index * 100}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: 8,
                      '& .feature-icon': {
                        transform: 'scale(1.1) rotate(-4deg)',
                      },
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        mb: 2.5,
                        color: 'white',
                        backgroundImage: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography gutterBottom variant="h6" component="h3" fontWeight={700}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
