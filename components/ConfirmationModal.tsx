// ConfirmationModal.tsx

import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button
} from '@chakra-ui/react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const handleConfirmClick = () => {
    console.log("Confirm button clicked in ConfirmationModal");
    onClose(); // Close the confirmation modal
    onConfirm(); // Call the function passed in props
};

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Action</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to perform this action?
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={handleConfirmClick}>Yes</Button>
          <Button variant="ghost" onClick={onClose}>No</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;