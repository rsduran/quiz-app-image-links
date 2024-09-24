// Dashboard.tsx

import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import LoadingLayout from '../components/LoadingLayout';
import CalendarEditor from '../components/CalendarEditor';
import DynamicQuizTable from '../components/DynamicQuizTable';
import CountdownTimer from '../components/CountdownTimer';
import MotivationalQuote from '../components/MotivationalQuote';

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddNewQuizSet = () => {
    // Refresh the quiz sets by updating the refresh key
    setRefreshKey((oldKey) => oldKey + 1);
  };

  // Determine the flex direction based on screen size
  const flexDirection = useBreakpointValue<'column' | 'row'>({
    base: 'column',
    md: 'row',
  }) || 'column';

  return (
    <LoadingLayout>
      <Box>
        <DashboardNavbar onAddNewQuizSet={handleAddNewQuizSet} />
        <CalendarEditor />
        <DynamicQuizTable key={refreshKey} />

        <Flex
          justify="center"
          mt={['10px', '20px']}
          flexDirection={flexDirection}
          alignItems="center"
          mx="auto"
          px={[4, 8]}
          maxW="1200px"
          gap={4}
        >
          <Box flexBasis={['100%', '30%']} flexShrink={0}>
            <CountdownTimer />
          </Box>
          <Box flexBasis={['100%', '70%']} mt={['20px', 0]}>
            <MotivationalQuote />
          </Box>
        </Flex>
      </Box>
    </LoadingLayout>
  );
};

export default Dashboard;
