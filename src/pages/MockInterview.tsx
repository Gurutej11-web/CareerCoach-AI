import React from 'react';
import { Box, Container } from '@mui/material';
import MockInterviewPage from '../components/interview/MockInterviewPage';
import PageHeader from '../components/common/PageHeader';

const MockInterview: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <PageHeader
          title="Mock Interview"
          subtitle="Practice with AI-powered interviews and get instant feedback on your performance"
        />

        <MockInterviewPage />
      </Container>
    </Box>
  );
};

export default MockInterview;
