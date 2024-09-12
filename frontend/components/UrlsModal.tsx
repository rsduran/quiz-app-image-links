// UrlsModal.tsx

import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text } from '@chakra-ui/react';

interface UrlsModalProps {
    isOpen: boolean;
    onClose: () => void;
    urls: string[] | undefined;
}

const UrlsModal = ({ isOpen, onClose, urls }: UrlsModalProps) => {
    // Remove duplicates by converting the array to a Set and then back to an array
    const uniqueUrls = urls ? Array.from(new Set(urls)) : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>URLs</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {uniqueUrls.length > 0 ? uniqueUrls.map((url, index) => (
                        <Text key={index}>{url}</Text>
                    )) : <Text>No URLs available.</Text>}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default UrlsModal;