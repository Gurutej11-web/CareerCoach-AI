import React, { useState } from 'react';
import { Box, Container, Grid } from '@mui/material';
import FileUploadArea from '../components/resume/FileUploadArea';
import SuggestionsPanel from '../components/resume/SuggestionsPanel';
import PageHeader from '../components/common/PageHeader';
import { useRecentActivity } from '../contexts/RecentActivityContext';

const ResumeTailoring: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const { addActivity } = useRecentActivity();

  const handleFilesUploaded = (newResumeFile: File | null, newJobDescFile: File | null) => {
    setResumeFile(newResumeFile);
    setJobDescFile(newJobDescFile);
    
    // Record this activity when files are uploaded
    if (newResumeFile && newJobDescFile) {
      addActivity(
        'resume',
        `Resume Uploaded: ${newResumeFile.name} for job description`
      );
    } else if (newResumeFile) {
      addActivity(
        'resume',
        `Resume Uploaded: ${newResumeFile.name}`
      );
    }
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <PageHeader
          title="Resume Tailoring"
          subtitle="Upload your resume and job description to get AI-powered suggestions for optimization"
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <FileUploadArea onFilesUploaded={handleFilesUploaded} />
          </Grid>
          <Grid item xs={12} md={7}>
            <SuggestionsPanel resumeFile={resumeFile} jobDescFile={jobDescFile} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ResumeTailoring; 