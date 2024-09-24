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
  quizSetId: string;
};

const transformMathContent = (content: string): string => {
  // Replace span-wrapped expressions
  let transformedContent = content.replace(/<span class=\"mathjax\">(.*?)<\/span>/g, '$$$1$$');

  // Pattern to identify raw LaTeX expressions
  const latexPattern = /\\\[([\s\S]*?)\\\]/g;
  transformedContent = transformedContent.replace(latexPattern, (match, p1) => `$$${p1}$$`);

  return transformedContent;
};

const processTextForImages = (text: string, quizSetId: string) => {
  let processedText = text;

  // Pattern for "within" images (Indiabix)
  const withinPattern = /\(image\)q(\d+)_([a-z0-9-]+)_within_(\d+)\(image\)/gi;
  processedText = processedText.replace(withinPattern, (match, p1, p2, p3) => {
    let imageName = `q${p1}_${quizSetId}_within_${p3}.png`;
    return `<img src="/assets/images/background/Within/${imageName}" alt="${imageName}" style="display: inline-block; width: auto; height: auto;">`;
  });

  // Pattern for "after" images (Indiabix and Pinoybix)
  const afterPattern = /\(image\)(q(\d+)_([a-z0-9-]+)_after_(\d+)|pinoybix_q(\d+)_([a-z0-9-]+)_after_1)\(image\)/gi;
  processedText = processedText.replace(afterPattern, (match, indiabixFull, indiabixQNum, indiabixUUID, indiabixAfterCount, pinoybixQNum, pinoybixUUID) => {
    let imageName, imagePath;
    if (indiabixQNum) {
      imageName = `q${indiabixQNum}_${quizSetId}_after_${indiabixAfterCount}.png`;
      imagePath = "After";
    } else if (pinoybixQNum) {
      imageName = `pinoybix_q${pinoybixQNum}_${quizSetId}_after_1.png`;
      imagePath = "PinoybixAfter";
    }
    return `<br><img src="/assets/images/background/${imagePath}/${imageName}" alt="${imageName}" style="display: block; margin-left: auto; margin-right: auto; width: auto; height: auto;"><br>`;
  });

  // Pattern for "Examveda" images
  const examvedaPattern = /\(image\)examveda_q(\d+)_([a-z0-9-]+)_main\(image\)/gi;
  processedText = processedText.replace(examvedaPattern, (match, p1, p2) => {
    let imageName = `examveda_q${p1}_${quizSetId}_main.jpg`;
    return `<img src="/assets/images/background/ExamvedaMain/${imageName}" alt="${imageName}" style="display: inline-block; width: auto; height: auto;">`;
  });

  // Corrected pattern for option images
  const optionPattern = /<img src="\/assets\/images\/background\/Option\/(q\d+_[a-z0-9-]+_option[A-D]_\d+\.png)"/gi;
  processedText = processedText.replace(optionPattern, (match, imageName) => {
    return `<img src="/assets/images/background/Option/${imageName}" alt="${imageName}" style="display: inline-block; width: auto; height: auto;">`;
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
  quizSetId,
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
    transformMathContent(question.question || 'Question'),
    quizSetId
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
        const processedOption = processTextForImages(transformedOption, quizSetId);

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