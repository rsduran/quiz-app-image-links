// QuestionDisplay.tsx

import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { MathJax } from "better-react-mathjax";
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

const processTextForImages = (text: string) => {
  let processedText = text;

  // Pattern for "within" images (Indiabix)
  const withinPattern = /\(image\)q(\d+)_within_(\d+)\(image\)/gi;
  processedText = processedText.replace(withinPattern, (match, p1, p2) => {
    let imageName = `q${p1}_within_${p2}.png`;
    return `<img src="/static/assets/images/background/Within/${imageName}" alt="${imageName}" style="display: inline-block; width: auto; height: auto;">`;
  });

  // Combined pattern for "after" images (Indiabix and Pinoybix)
  const afterPattern = /<br\/>\(image\)(q(\d+)_after_(\d+)|pinoybix_q(\d+)_after_1)\(image\)/gi;
  processedText = processedText.replace(afterPattern, (match, fullMatch, indiabixQNum, indiabixPNum, pinoybixQNum) => {
    let imageName, imagePath;
    if (indiabixQNum) {
      imageName = `q${indiabixQNum}_after_${indiabixPNum}.png`;
      imagePath = "After"; // Path for Indiabix after images
    } else if (pinoybixQNum) {
      imageName = `pinoybix_q${pinoybixQNum}_after_1.png`;
      imagePath = "PinoybixAfter"; // Path for Pinoybix after images
    }
    return `<br><img src="/static/assets/images/background/${imagePath}/${imageName}" alt="${imageName}" style="display: block; margin-left: auto; margin-right: auto; width: auto; height: auto;"><br>`;
  });

  // Pattern for Examveda main images
  const examvedaMainPattern = /\(image\)examveda_q(\d+)_main\(image\)/gi;
  processedText = processedText.replace(examvedaMainPattern, (match, p1) => {
    let imageName = `examveda_q${p1}_main.jpg`; // Assuming PNG format for simplicity
    return `<img src="/static/assets/images/background/ExamvedaMain/${imageName}" alt="${imageName}" style="display: inline-block; width: auto; height: auto;">`;
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
  const selectedBorderColor = useColorModeValue("blue.500", "blue.300");
  const unselectedBorderColor = useColorModeValue("gray.200", "gray.600");
  const selectedTextColor = useColorModeValue("blue.600", "blue.200");
  const unselectedTextColor = cardTextColor;

  const handleOptionClick = (optionIndex: number) => {
    const optionLabel = `Option ${String.fromCharCode(65 + optionIndex)}`;
    if (selectedOption === optionLabel) {
      onOptionSelect(null);
    } else {
      onOptionSelect(optionIndex);
    }
  };

  const processedQuestion = processTextForImages(transformMathContent(question.question || 'Question'));

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg={cardBgColor} color={cardTextColor}>
      <MathJax dynamic>
        <Text fontFamily="'HurmeGeometricSans2', -apple-system, 'system-ui', sans-serif" fontSize="xl" mb={4}>
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
            p={2}
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