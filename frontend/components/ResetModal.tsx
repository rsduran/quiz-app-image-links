// ResetModal.tsx

import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button
} from '@chakra-ui/react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onReset }) => {
  const handleResetClick = () => {
    console.log("Reset button clicked in ResetModal");
    onReset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reset Questions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Are you sure you want to reset all questions and answers?</ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={handleResetClick}>Yes</Button>
          <Button variant="ghost" onClick={onClose}>No</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResetModal;