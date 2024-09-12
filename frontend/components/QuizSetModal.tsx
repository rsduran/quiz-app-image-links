// QuizSetModal.tsx

import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Input } from '@chakra-ui/react';
import ScrapingSection from './ScrapingSection';

interface QuizSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewQuizSet: (newQuizSetTitle: string) => void; // Update this line
}

const QuizSetModal: React.FC<QuizSetModalProps> = ({ isOpen, onClose, onAddNewQuizSet }) => {
  const [quizSetTitle, setQuizSetTitle] = useState('');

  const handleScrapeComplete = (success: boolean, quizSetTitle: string) => {
    if (success) {
      onAddNewQuizSet(quizSetTitle);
      onClose();
    }
  };  

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Quiz Set</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Quiz Set Title"
            value={quizSetTitle}
            onChange={(e) => setQuizSetTitle(e.target.value)}
            mb="4"
          />
          <ScrapingSection
            onScrapeComplete={handleScrapeComplete}
            quizSetTitle={quizSetTitle}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuizSetModal;