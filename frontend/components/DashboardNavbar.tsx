// DashboardNavbar.tsx

import React from 'react';
import { Flex, IconButton, Text, Box, useDisclosure, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { PlusIcon, ExitIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import QuizSetModal from './QuizSetModal';

interface DashboardNavbarProps {
  onAddNewQuizSet: (newQuizSetTitle: string) => void;
}

export default function DashboardNavbar({ onAddNewQuizSet }: DashboardNavbarProps) {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('black', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700'); // Line color based on light/dark mode

  return (
    <Flex
      bg={useColorModeValue('white', 'gray.800')}
      color={useColorModeValue('black', 'white')}
      minH={'60px'}
      py={{ base: 2 }}
      px={{ base: 4 }}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      align={'center'}
      mx={{ base: 4 }}
    >
      <Flex
        w="100%"
        justify="space-between"
        align="center"
      >
        <IconButton
          icon={<ExitIcon style={{ transform: 'scaleX(-1)', width: '20px', height: '20px' }} />}
          onClick={() => router.push('/')}
          aria-label="Go Back"
          variant={'ghost'}
        />

        <Text fontSize="2xl" fontWeight="extrabold" cursor="pointer" onClick={() => router.push('/Dashboard')}>
          Dashboard
        </Text>
        
        <Flex align={'center'}>
          <IconButton
            icon={<PlusIcon style={{ width: '22px', height: '22px' }} />}
            onClick={onOpen}
            aria-label="Add Quiz Set"
            variant={'ghost'}
            mr={2} // gap between icons
          />

          <IconButton
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
            variant={'ghost'}
            aria-label={'Toggle Dark Mode'}
          />
        </Flex>
      </Flex>

      <QuizSetModal
        isOpen={isOpen}
        onClose={onClose}
        onAddNewQuizSet={onAddNewQuizSet}
      />
    </Flex>
  );
}