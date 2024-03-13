// components/LoadingLayout.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

type LoadingLayoutProps = {
  children: ReactNode;
};

const LoadingLayout = ({ children }: LoadingLayoutProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assume the component is loaded after a short delay
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)">
        <Spinner size="xl" />
      </Box>
    );
  }

  return <>{children}</>;
};

export default LoadingLayout;