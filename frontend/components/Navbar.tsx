// components/Navbar.tsx
import React from 'react';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  Button,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
  Spacer,
  Link,
  HStack
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'; // Import icons

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const iconBg = useColorModeValue('white', 'gray.800'); // Background color for icons
  const iconHoverBgLight = '#edf2f8'; // Hover color for icons in light mode
  const iconHoverBgDark = '#2c323d'; // Hover color for icons in dark mode

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
      <Flex align={'center'}>
        <NextLink href="/" passHref>
          <Link _hover={{ textDecoration: 'none' }}> {/* Remove underline on hover */}
            <Text fontSize="2xl" fontWeight="extrabold">athena.</Text> {/* Increased font size */}
          </Link>
        </NextLink>
      </Flex>

      {/* Navigation Links */}
      <Flex ml={4} align="center"> {/* Vertically align the navigation links */}
        {['About', 'Contact', 'Resume', 'Email', 'Projects'].map((link) => (
          <Button as={Link} variant={'link'} mx={3} href={`#${link.toLowerCase()}`} fontSize="md" _hover={{ 
              textDecoration: 'none',
              color: useColorModeValue('black', 'white') 
          }}>
            {link}
          </Button>
        ))}
      </Flex>

      <Spacer />

      <Flex align={'center'}>
        {/* Social Media Icons */}
        <HStack spacing={2} mr={2}>
          <Link href="https://github.com/yourusername" isExternal>
            <IconButton aria-label="GitHub" icon={<FaGithub />} bg={iconBg} _hover={{ bg: colorMode === 'light' ? iconHoverBgLight : iconHoverBgDark }} />
          </Link>
          <Link href="https://linkedin.com/in/yourusername" isExternal>
            <IconButton aria-label="LinkedIn" icon={<FaLinkedin />} bg={iconBg} _hover={{ bg: colorMode === 'light' ? iconHoverBgLight : iconHoverBgDark }} />
          </Link>
          <Link href="https://twitter.com/yourusername" isExternal>
            <IconButton aria-label="Twitter" icon={<FaTwitter />} bg={iconBg} _hover={{ bg: colorMode === 'light' ? iconHoverBgLight : iconHoverBgDark }} />
          </Link>
        </HStack>

        {/* Theme Toggle Button */}
        <IconButton
          icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
          onClick={toggleColorMode}
          variant={'ghost'}
          aria-label={'Toggle Dark Mode'}
          mr={2}
        />
      </Flex>
    </Flex>
  );
}