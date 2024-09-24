// DashboardNavbar.tsx

import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Text,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  HStack,
  Spacer,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { PlusIcon, ExitIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import QuizSetModal from './QuizSetModal';

interface DashboardNavbarProps {
  onAddNewQuizSet: (newQuizSetTitle: string) => void;
}

export default function DashboardNavbar({
  onAddNewQuizSet,
}: DashboardNavbarProps) {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      color={useColorModeValue('black', 'white')}
      px={4}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex h={16} alignItems={'center'}>
        {/* Left Side: Back Button and Title */}
        <Flex alignItems={'center'}>
          <IconButton
            icon={
              <ExitIcon
                style={{
                  transform: 'scaleX(-1)',
                  width: '20px',
                  height: '20px',
                }}
              />
            }
            onClick={() => router.push('/')}
            aria-label="Go Back"
            variant={'ghost'}
          />
          <Text
            fontSize="2xl"
            fontWeight="extrabold"
            cursor="pointer"
            onClick={() => router.push('/Dashboard')}
            ml={2}
          >
            Dashboard
          </Text>
        </Flex>

        <Spacer />

        {/* Right Side: Add Button and Theme Toggle */}
        <HStack spacing={2}>
          <IconButton
            icon={<PlusIcon style={{ width: '22px', height: '22px' }} />}
            onClick={onOpen}
            aria-label="Add Quiz Set"
            variant={'ghost'}
          />

          <IconButton
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
            variant={'ghost'}
            aria-label={'Toggle Dark Mode'}
          />
        </HStack>
      </Flex>

      <QuizSetModal
        isOpen={isOpen}
        onClose={onClose}
        onAddNewQuizSet={onAddNewQuizSet}
      />
    </Box>
  );
}
