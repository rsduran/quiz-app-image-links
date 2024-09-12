import React from 'react';
import { Flex, IconButton, Input, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, RepeatIcon } from '@chakra-ui/icons';

type NavigationButtonsProps = {
  currentQuestionIndex: number;
  totalQuestions: number;
  onNavigate: (action: 'prev' | 'next' | 'reset' | 'goto', value?: number) => void;
  iconBg: string; // Add this prop
  iconHoverBg: string; // Add this prop
};

const NavigationButtons = ({ 
  currentQuestionIndex, 
  totalQuestions, 
  onNavigate, 
  iconBg, // Add this
  iconHoverBg // Add this
}: NavigationButtonsProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onNavigate('goto', isNaN(value) ? 0 : value - 1);
  };

  return (
    <Flex align="center" justify="space-between">
      <IconButton 
        aria-label="Previous" 
        icon={<ChevronLeftIcon />} 
        onClick={() => onNavigate('prev')} 
        isDisabled={currentQuestionIndex === 0}
        bg={iconBg} // Set background to transparent
        _hover={{ bg: iconHoverBg }} // Apply hover color based on the mode
      />
      {/* ... other input and text components ... */}
      <IconButton 
        aria-label="Reset" 
        icon={<RepeatIcon />} 
        onClick={() => onNavigate('reset')} 
        bg={iconBg} // Set background to transparent
        _hover={{ bg: iconHoverBg }} // Apply hover color based on the mode
      />
    </Flex>
  );
};

export default NavigationButtons;