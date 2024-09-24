// components/Navbar.tsx
import React from 'react';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
  Link,
  HStack,
  VStack,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import {
  MoonIcon,
  SunIcon,
  HamburgerIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const iconBg = useColorModeValue('white', 'gray.800');
  const iconHoverBgLight = '#edf2f8';
  const iconHoverBgDark = '#2c323d';

  const { isOpen, onToggle } = useDisclosure();

  // Define consistent sizes for Chakra UI icons and React Icons
  const chakraIconSize = 5; // Size for HamburgerIcon and other Chakra UI icons
  const closeIconSize = 3.5; // Smaller size for CloseIcon
  const reactIconSize = '20px'; // Adjust as needed for React Icons

  // Common IconButton styles
  const iconButtonStyles = {
    bg: iconBg,
    _hover: {
      bg: colorMode === 'light' ? iconHoverBgLight : iconHoverBgDark,
    },
    size: 'md',
    // Removed 'isRound: true' to have square-like hover backgrounds
  };

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
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        {/* Left Side: Logo and Navigation Links */}
        <Flex alignItems={'center'}>
          {/* Logo */}
          <NextLink href="/" passHref>
            <Link
              _hover={{ textDecoration: 'none' }}
              display="flex"
              alignItems="center"
            >
              <Text fontSize="2xl" fontWeight="extrabold" lineHeight="1" mb={1}>
                athena.
              </Text>
            </Link>
          </NextLink>

          {/* Desktop Navigation Links */}
          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
            ml={4}
          >
            {['About', 'Contact', 'Resume', 'Email', 'Projects'].map((link) => (
              <NextLink href={`#${link.toLowerCase()}`} passHref key={link}>
                <Link
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    bg: useColorModeValue('gray.200', 'gray.700'),
                  }}
                  fontSize="md"
                >
                  {link}
                </Link>
              </NextLink>
            ))}
          </HStack>
        </Flex>

        {/* Right Side: Social Media Icons, Mobile Menu Button, Theme Toggle Button */}
        <Flex alignItems={'center'}>
          {/* Social Media Icons (Desktop Only) */}
          <HStack spacing={2} mr={2} display={{ base: 'none', md: 'flex' }}>
            <Link href="https://github.com/rsduran" isExternal>
              <IconButton
                aria-label="GitHub"
                icon={<FaGithub size={reactIconSize} />}
                {...iconButtonStyles}
              />
            </Link>
            <Link
              href="https://www.linkedin.com/in/reineir-duran-6a4791257"
              isExternal
            >
              <IconButton
                aria-label="LinkedIn"
                icon={<FaLinkedin size={reactIconSize} />}
                {...iconButtonStyles}
              />
            </Link>
            <Link href="https://x.com/rsduran_devops" isExternal>
              <IconButton
                aria-label="Twitter"
                icon={<FaTwitter size={reactIconSize} />}
                {...iconButtonStyles}
              />
            </Link>
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            aria-label={'Open Menu'}
            icon={
              isOpen ? (
                <CloseIcon w={closeIconSize} h={closeIconSize} />
              ) : (
                <HamburgerIcon w={chakraIconSize} h={chakraIconSize} />
              )
            }
            display={{ md: 'none' }}
            onClick={onToggle}
            mr={2}
            mb={1} // Added mb={1} to adjust vertical alignment
            {...iconButtonStyles}
          />

          {/* Theme Toggle Button */}
          <IconButton
            aria-label={'Toggle Dark Mode'}
            icon={
              colorMode === 'dark' ? (
                <SunIcon w={chakraIconSize} h={chakraIconSize} />
              ) : (
                <MoonIcon w={chakraIconSize} h={chakraIconSize} />
              )
            }
            onClick={toggleColorMode}
            {...iconButtonStyles}
          />
        </Flex>
      </Flex>

      {/* Mobile Navigation Menu */}
      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }}>
          <VStack as={'nav'} spacing={4}>
            {['About', 'Contact', 'Resume', 'Email', 'Projects'].map((link) => (
              <NextLink href={`#${link.toLowerCase()}`} passHref key={link}>
                <Link
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    bg: useColorModeValue('gray.200', 'gray.700'),
                  }}
                  fontSize="md"
                  w="100%"
                  textAlign="center"
                >
                  {link}
                </Link>
              </NextLink>
            ))}

            {/* Social Media Icons in Mobile Menu */}
            <HStack spacing={2}>
              <Link href="https://github.com/rsduran" isExternal>
                <IconButton
                  aria-label="GitHub"
                  icon={<FaGithub size={reactIconSize} />}
                  {...iconButtonStyles}
                />
              </Link>
              <Link
                href="https://www.linkedin.com/in/reineir-duran-6a4791257"
                isExternal
              >
                <IconButton
                  aria-label="LinkedIn"
                  icon={<FaLinkedin size={reactIconSize} />}
                  {...iconButtonStyles}
                />
              </Link>
              <Link href="https://x.com/rsduran_devops" isExternal>
                <IconButton
                  aria-label="Twitter"
                  icon={<FaTwitter size={reactIconSize} />}
                  {...iconButtonStyles}
                />
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}
