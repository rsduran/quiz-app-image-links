// UnansweredQuestionsModal.tsx

import React from 'react';
import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, VStack, Box, useColorModeValue } from '@chakra-ui/react';
import { StarIcon, StarFilledIcon } from '@radix-ui/react-icons';
import { Question } from '../utils/types';

const stripHtml = (htmlString: string): string => {
    return htmlString.replace(/<[^>]*>?/gm, '');
};

interface UnansweredQuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    unansweredQuestions: Question[];
    navigateToQuestion: (index: number) => void;
    favorites: Set<number>;
    setSelectedFilter: (filter: string) => void;
    onSubmitWithUnanswered: () => void;
    currentFilter: string;
    getQuestionIndex: (questionId: number) => number;
}

const UnansweredQuestionsModal: React.FC<UnansweredQuestionsModalProps> = ({
    isOpen,
    onClose,
    unansweredQuestions,
    navigateToQuestion,
    favorites,
    setSelectedFilter,
    onSubmitWithUnanswered,
    currentFilter,
    getQuestionIndex
}) => {
    const bgColor = useColorModeValue('gray.100', 'gray.600');
    const hoverBgColor = useColorModeValue('blue.100', 'blue.500');
    const favoriteBgColor = useColorModeValue('gray.300', 'gray.500');

    const handleNavigationToUnanswered = () => {
        setSelectedFilter('unanswered');
        navigateToQuestion(0); // Navigate to the first question in Unanswered tab
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Unanswered Questions</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>{'You have unanswered questions. Do you want to continue to submit?' }</Text>
                    <Text mt={4}>
                        <Text as="span" textDecoration="underline" cursor="pointer" onClick={handleNavigationToUnanswered}>
                            Click here
                        </Text>
                        {" to answer them."}
                    </Text>
                    <VStack mt={4} spacing={4} align="stretch">
                        {unansweredQuestions.map((question) => {
                            const questionIndex = getQuestionIndex(question.id);
                            if (questionIndex < 0) return null; // Skip rendering this question if index is -1

                            return (
                                <Box
                                    key={question.id}
                                    p={3}
                                    width="100%"
                                    bg={favorites.has(question.id) ? favoriteBgColor : bgColor}
                                    borderRadius="md"
                                    _hover={{ bg: hoverBgColor, cursor: 'pointer' }}
                                    onClick={() => {
                                        navigateToQuestion(questionIndex); // Use index as is
                                        onClose();
                                    }}
                                >
                                    Q{questionIndex + 1}: {stripHtml(question.question)}
                                    {favorites.has(question.id) ? <StarFilledIcon /> : <StarIcon />}
                                </Box>
                            );
                        })}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onSubmitWithUnanswered} mr={3}>Yes</Button>
                    <Button onClick={onClose}>No</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UnansweredQuestionsModal;