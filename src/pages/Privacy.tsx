import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PageHeader from '../components/common/PageHeader';

const Privacy: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
        <PageHeader title="Privacy Policy" backTo="/" />
        <Stack spacing={3}>
          <Typography color="text.secondary">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>

          <Typography>
            This page explains what data CareerCoach AI stores and how it's used.
          </Typography>

          <Typography variant="h6" fontWeight="bold">What we store</Typography>
          <Typography component="div">
            <ul>
              <li>Account details: username, email, and optional profile fields (name, job title, company, phone).</li>
              <li>Resumes and job descriptions you upload, and the analysis results generated from them.</li>
              <li>Mock interview recordings, transcripts, and feedback.</li>
              <li>Chatbot conversation history.</li>
              <li>A lightweight activity log (what you did and when) that powers your dashboard.</li>
            </ul>
          </Typography>
          <Typography>
            All of this is stored tied to your account on the server — not in your browser's local storage —
            so it follows you across devices and stays private from other people using the same device.
          </Typography>

          <Typography variant="h6" fontWeight="bold">Third parties</Typography>
          <Typography>
            Resume/interview text and chatbot messages are sent to Groq's API (and, where configured, Azure
            Cognitive Services) to generate AI feedback. These providers process the content to return a
            response; refer to their respective privacy policies for how they handle data in transit.
          </Typography>

          <Typography variant="h6" fontWeight="bold">Your controls</Typography>
          <Typography>
            You can update your profile at any time from the Profile page. To delete your account and all
            associated data, use the "Delete account" option on the Profile page — this permanently removes
            your resumes, analyses, interviews, chat history, and activity log.
          </Typography>

          <Typography variant="h6" fontWeight="bold">Security</Typography>
          <Typography>
            Passwords are hashed, never stored in plain text. Authentication uses short-lived JWT access
            tokens with rotating refresh tokens. Uploaded files are validated for type and size before
            processing.
          </Typography>

          <Typography variant="h6" fontWeight="bold">Contact</Typography>
          <Typography>
            Questions about this policy can be raised via the project's{' '}
            <a href="https://github.com/Gurutej11-web/CareerCoach-AI" target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>.
          </Typography>
        </Stack>
      </Container>
      <Footer />
    </Box>
  );
};

export default Privacy;
