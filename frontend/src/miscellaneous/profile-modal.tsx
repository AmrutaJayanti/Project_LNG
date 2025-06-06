import React from 'react';
import type { FC } from 'react';
import { ViewIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  Button,
  IconButton,
  useDisclosure,
  Text,
} from '@chakra-ui/react';
import type { UserProps } from '../types';
import './../styles/profileModal.css'; // Import CSS

interface Props {
  user: UserProps;
  children?: React.ReactNode;
}

const ProfileModal: FC<Props> = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          className="profile-modal-icon-button"
          display={{ base: 'flex' }}
          icon={<ViewIcon />}
          onClick={onOpen}
          aria-label="Open profile modal"
          width="25%"
        />
      )}
      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay className="chakra-modal__overlay" />
        <ModalContent className="chakra-modal__content">
          <ModalHeader className="chakra-modal__header">{user.name}</ModalHeader>
          <ModalCloseButton className="chakra-modal__close-btn" />
          <ModalBody className="chakra-modal__body">
            <Image
              className="profile-modal-image"
              src={user.pic}
              alt={user.name}
              loading="lazy"
            />
            <Text className="profile-modal-text">
              Email: <strong>{user.email}</strong>
            </Text>
          </ModalBody>
          <ModalFooter className="chakra-modal__footer">
            <Button className="chakra-button" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
