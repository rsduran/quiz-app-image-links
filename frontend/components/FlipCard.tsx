// FlipCard.tsx

import React from 'react';
import { Box, Fade } from '@chakra-ui/react';

interface FlipCardProps {
  isFlipped: boolean;
  onClick: () => void;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  bgColor?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({
  isFlipped,
  onClick,
  frontContent,
  backContent,
  bgColor,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <Box
      onClick={handleCardClick}
      cursor="pointer"
      borderWidth="1px"
      borderColor="currentColor"
      borderRadius="lg"
      transition="border-color 0.2s"
      bg={bgColor}
      p={4}
      width="100%" // Ensure it fills the parent Box
    >
      <Fade in={!isFlipped}>
        {!isFlipped && <Box textAlign="center">{frontContent}</Box>}
      </Fade>
      <Fade in={isFlipped}>
        {isFlipped && <Box textAlign="center">{backContent}</Box>}
      </Fade>
    </Box>
  );
};

export default FlipCard;
