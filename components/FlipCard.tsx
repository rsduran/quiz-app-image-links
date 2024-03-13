// FlipCard.tsx

import React from 'react';
import { Box, Fade } from '@chakra-ui/react';

interface FlipCardProps {
  isFlipped: boolean;
  onClick: () => void;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
}

const FlipCard: React.FC<FlipCardProps> = ({ isFlipped, onClick, frontContent, backContent }) => {
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
    >
      <Fade in={!isFlipped}>
        {!isFlipped && frontContent}
      </Fade>
      <Fade in={isFlipped}>
        {isFlipped && backContent}
      </Fade>
    </Box>
  );
};

export default FlipCard;