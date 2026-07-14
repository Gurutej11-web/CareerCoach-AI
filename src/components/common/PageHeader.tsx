import React from 'react';
import { Box, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Home as HomeIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, backTo = '/dashboard' }) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
      <IconButton
        component={RouterLink}
        to={backTo}
        color="primary"
        sx={{ mr: 2 }}
        aria-label="Back to dashboard"
      >
        <ArrowBackIcon />
      </IconButton>

      <Box>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
