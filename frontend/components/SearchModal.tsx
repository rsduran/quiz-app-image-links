// SearchModal.tsx

import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Input, VStack, Box, useColorMode, useColorModeValue, Highlight } from '@chakra-ui/react';
import { StarIcon, StarFilledIcon } from '@radix-ui/react-icons';
import { Question } from '../utils/types';

const stripHtml = (htmlString: string): string => {
    return htmlString.replace(/<[^>]*>?/gm, '');
};

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchKeyword: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    questions: Question[];
    onNavigateToQuestion: (index: number) => void;
    favorites: Set<number>;
    currentFilter: string;
    getQuestionIndex: (questionId: number) => number;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, searchKeyword, onSearchChange, questions, onNavigateToQuestion, favorites, currentFilter, getQuestionIndex }) => {
    const searchResults = searchKeyword ? questions.filter(q => stripHtml(q.question).toLowerCase().includes(searchKeyword.toLowerCase())) : [];
    const { colorMode } = useColorMode();
    const bgColor = useColorModeValue('gray.100', 'gray.600');
    const hoverBgColor = useColorModeValue('blue.100', 'blue.500');
    const highlightColor = useColorModeValue('yellow.300', 'yellow.300');
    const favoriteBgColor = useColorModeValue('gray.300', 'gray.500');

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Search Questions</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Input placeholder="Search for questions..." value={searchKeyword} onChange={onSearchChange} />
                    <VStack mt={4} spacing={4} align="stretch">
                        {searchResults.map((question) => {
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
                                        onNavigateToQuestion(questionIndex); // Use index as is
                                        onClose();
                                    }}
                                >
                                    Q{questionIndex + 1}: <Highlight query={searchKeyword} styles={{ bg: highlightColor }}>{stripHtml(question.question)}</Highlight>
                                    {favorites.has(question.id) ? <StarFilledIcon /> : <StarIcon />}
                                </Box>
                            );
                        })}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default SearchModal;