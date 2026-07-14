import React, { useEffect, useRef, useState } from 'react';
import { LinearProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';

const TopProgressBar: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <LinearProgress
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
        height: 3,
      }}
    />
  );
};

export default TopProgressBar;
