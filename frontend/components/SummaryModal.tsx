// SummaryModal.tsx

import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Text } from '@chakra-ui/react';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    score: number;
    totalQuestions: number;
    navigateToIncorrect: () => void;
    incorrectQuestionsCount: number;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, score, totalQuestions, navigateToIncorrect, incorrectQuestionsCount }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Quiz Summary</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>{`You scored ${score} out of ${totalQuestions}`}</Text>
                    {incorrectQuestionsCount > 0 && (
                        <Text mt={4}>
                            <Text as="span" textDecoration="underline" cursor="pointer" onClick={navigateToIncorrect}>
                                Click here
                            </Text>
                            {" to go over your incorrect answers."}
                        </Text>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SummaryModal;