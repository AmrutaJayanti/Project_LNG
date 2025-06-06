import {
  Box,
  Button,
  Input,
  Spinner,
    useToast,
} from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/form-control';
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import './../../styles/groupChat.css';
import { MdOutlineGroups2 } from 'react-icons/md';
import { ChatState } from '../../context/chat-provider';
import UserBadge from './user-badge';
import type { UserProps } from '../../types';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import UserList from './user-list';

export interface ChatBoxProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
  fetchMessages: () => void;
}

const UpdateGroupChat: React.FC<ChatBoxProps> = ({
  fetchAgain,
  setFetchAgain,
  fetchMessages,
}) => {
  const timer = React.useRef<NodeJS.Timeout>();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = ChatState();
  const [groupChatName, setGroupChatName] = useState<string>(selectedChat.chatName);
  const [search, setSearch] = useState<string>('');
  const [searchResult, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [renameLoading, setRenameLoading] = useState<boolean>(false);

  const handleReName = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const config: AxiosRequestConfig = {
        baseURL: 'https://mern-chat-utlm.onrender.com',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        'api/chat/rename',
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config,
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: 'Failed to rename Group Chat!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setRenameLoading(false);
      setGroupChatName('');
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    clearTimeout(timer.current);
    setSearch(value);
    if (!value) return;

    try {
      setLoading(true);
      const config: AxiosRequestConfig = {
        baseURL: 'https://mern-chat-utlm.onrender.com',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${value}`, config);
      setSearchResults(data);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: 'Something went wrong',
        description: error.response?.data?.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  const handleAddUser = async (userToAdd: UserProps) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast({
        title: 'User already in the group!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }

    try {
      setLoading(true);
      const config: AxiosRequestConfig = {
        baseURL: 'https://mern-chat-utlm.onrender.com',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        '/api/chat/groupadd',
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config,
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
      setSearch('');
      setSearchResults([]);
    } catch (error) {
      toast({
        title: 'Something went wrong!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove: UserProps) => {
    try {
      setLoading(true);
      const config: AxiosRequestConfig = {
        baseURL: 'https://mern-chat-utlm.onrender.com',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config,
      );
      userToRemove._id === user._id
        ? setSelectedChat(null)
        : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Something went wrong!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };

  return (
    <div className="mod">
      <MdOutlineGroups2 className="group-icon" onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'xs', sm: 'sm', md: 'md' }}>
        <ModalOverlay />
        <ModalContent className="join-modal-panel">
          <ModalHeader className="join-modal-title">{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody className="join-modal-content">
            <Box className="user-badge-box">
              {selectedChat.users.map((u) => (
                <UserBadge key={u._id} user={u} handleFunction={() => handleRemove(u)} />
              ))}
            </Box>
            <FormControl className="join-form-control">
              <Input
                placeholder="Chat Name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                className="join-input"
                aria-label="Rename group chat"
              />
              <Button
                isLoading={renameLoading}
                onClick={handleReName}
                className="join-button"
              >
                Rename
              </Button>
            </FormControl>
            <FormControl className="join-form-control">
              <Input
                placeholder="Add User to Group"
                value={search}
                onChange={handleSearch}
                className="join-input"
                aria-label="Search users to add"
              />
            </FormControl>
            {loading ? (
              <Box className="spinner-container">
                <Spinner size="md" />
              </Box>
            ) : (
              searchResult?.slice(0, 4).map((user) => (
                <UserList key={user._id} user={user} handleFunction={() => handleAddUser(user)} />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button className="join-play-button" onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UpdateGroupChat;
