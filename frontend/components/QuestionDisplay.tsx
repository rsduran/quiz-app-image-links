// QuestionDisplay.tsx

import React from 'react';
import { Box, Text, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import { MathJax } from 'better-react-mathjax';
import { Question } from '../utils/types';

type QuestionDisplayProps = {
  question: Question;
  onOptionSelect: (optionIndex: number | null) => void;
  selectedOption: string | null;
  cardBgColor: string;
  cardTextColor: string;
  unselectedOptionBg: string;
};

const transformMathContent = (content: string): string => {
  // Replace span-wrapped expressions
  let transformedContent = content.replace(/<span class=\"mathjax\">(.*?)<\/span>/g, '$$$1$$');

  // Pattern to identify raw LaTeX expressions
  const latexPattern = /\\\[([\s\S]*?)\\\]/g;
  transformedContent = transformedContent.replace(latexPattern, (match, p1) => `$$${p1}$$`);

  return transformedContent;
};

const processTextForImages = (text: string, baseUrl: string = "https://www.indiabix.com"): string => {
  let processedText: string = text;

  // Use a generic image pattern to find all img tags in the text
  const imagePattern: RegExp = /<img.*?src="(.*?)".*?>/gi;
  processedText = processedText.replace(imagePattern, (match: string, imgUrl: string): string => {
    // Check if the imgUrl is a relative path (i.e., starts with '/')
    if (imgUrl.startsWith('/')) {
      // Prepend the base URL if it's a relative path
      imgUrl = `${baseUrl}${imgUrl}`;
    }

    // Replace the image tag with the complete image URL
    return `<img src="${imgUrl}" alt="Image" style="display: inline-block; width: auto; height: auto;">`;
  });

  return processedText;
};

const QuestionDisplay = ({
  question,
  onOptionSelect,
  selectedOption,
  cardBgColor,
  cardTextColor,
  unselectedOptionBg,
}: QuestionDisplayProps) => {
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');
  const unselectedBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedTextColor = useColorModeValue('blue.600', 'blue.200');
  const unselectedTextColor = cardTextColor;

  const optionPadding = useBreakpointValue({ base: 4, md: 2 });
  const optionFontSize = useBreakpointValue({ base: 'md', md: 'sm' });

  const handleOptionClick = (optionIndex: number) => {
    const optionLabel = `Option ${String.fromCharCode(65 + optionIndex)}`;
    if (selectedOption === optionLabel) {
      onOptionSelect(null);
    } else {
      onOptionSelect(optionIndex);
    }
  };

  const processedQuestion = processTextForImages(
    transformMathContent(question.question || 'Question')
  );

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg={cardBgColor} color={cardTextColor}>
      <MathJax dynamic>
        <Text
          fontFamily="'HurmeGeometricSans2', -apple-system, 'system-ui', sans-serif"
          fontSize="xl"
          mb={4}
        >
          <div dangerouslySetInnerHTML={{ __html: processedQuestion }} />
        </Text>
      </MathJax>

      {question.options.map((option, index) => {
        const optionLabel = `Option ${String.fromCharCode(65 + index)}`;
        const isSelected = selectedOption === optionLabel;

        const transformedOption = transformMathContent(option);
        const processedOption = processTextForImages(transformedOption);

        return (
          <Box
            key={index}
            p={optionPadding}
            my={2}
            borderWidth="2px"
            borderRadius="lg"
            borderColor={isSelected ? selectedBorderColor : unselectedBorderColor}
            bg={unselectedOptionBg}
            onClick={() => handleOptionClick(index)}
            cursor="pointer"
            fontFamily="'HurmeGeometricSans2', -apple-system, 'system-ui', sans-serif"
            color={isSelected ? selectedTextColor : unselectedTextColor}
            _hover={{ borderColor: selectedBorderColor }}
            fontSize={optionFontSize}
          >
            <MathJax dynamic>
              <div dangerouslySetInnerHTML={{ __html: processedOption }} />
            </MathJax>
          </Box>
        );
      })}
    </Box>
  );
};

export default QuestionDisplay;