import React, { ReactNode } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Box,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useRecentActivity, Activity } from '../../contexts/RecentActivityContext';

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  buttonText: string;
  linkTo: string;
  activityType: Activity['type'];
  activityDescription?: string;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  linkTo,
  activityType,
  activityDescription,
}) => {
  const { addActivity } = useRecentActivity();

  const handleButtonClick = () => {
    // Create a description if not provided
    const description = activityDescription || `${title} started`;
    // Add this action to recent activities
    addActivity(activityType, description);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: 8,
          '& .quick-access-icon': {
            transform: 'scale(1.15)',
          },
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box
          className="quick-access-icon"
          sx={{
            display: 'flex',
            mb: 2,
            color: 'primary.main',
            transition: 'transform 0.25s ease',
            width: 'fit-content',
          }}
        >
          {icon}
        </Box>
        <Typography gutterBottom variant="h5" component="h2" fontWeight="bold">
          {title}
        </Typography>
        <Typography sx={{ mb: 3, fontSize: '18px'}} color="text.secondary">
          {description}
        </Typography>
        <Button
          component={RouterLink}
          to={linkTo}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 'auto', fontSize: '20px'}}
          onClick={handleButtonClick}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickAccessCard; 