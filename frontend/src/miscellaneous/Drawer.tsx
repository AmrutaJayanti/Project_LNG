import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Tooltip,
  useDisclosure,
  useToast,
  CloseButton
} from '@chakra-ui/react';
import React, { useState ,useRef} from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import {  ChevronDownIcon } from '@chakra-ui/icons';
import { ChatState } from '../context/chat-provider';
import ProfileModal from './profile-modal';
import { Link, useNavigate } from 'react-router-dom';
import type { UserProps } from '../types';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import ChatLoading from '../components/chat/chat-loading';
import UserList from '../components/chat/user-list';
import { IoGameControllerOutline } from 'react-icons/io5';
import '../styles/sliderDrawer.css';
import { IoChatbubbleOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";

const SlideDrawer: React.FC = () => {
  const navigate = useNavigate();
  const timer = useRef<NodeJS.Timeout>();
  const toast = useToast();
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
  } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingchat, setLoadingchat] = useState<boolean>(false);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  async function HandleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    clearTimeout(timer.current);
    setSearch(value);
    try {
      setLoading(true);
      const config: AxiosRequestConfig = {
        baseURL: 'https://project-lng-2.onrender.com',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${value}`, config);
      setLoading(false);
      setSearchResults(data);
    } catch (error: any) {
      console.error(error.message);
      toast({
        title: 'Error Occurred!',
        description: 'Failed to load Search Results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  }

  async function accessChat(userId: string) {
    try {
      setLoadingchat(true);
      const config: AxiosRequestConfig = {
        baseURL: 'https://project-lng-2.onrender.com',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post('/api/chat', { userId }, config);
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setLoadingchat(false);
      onClose();
      navigate('/chats');
    } catch (error: any) {
      toast({
        title: 'Error Fetching the chat!',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  }

  return (
    <>
      <Box className="slide-drawer-container">
        <div className="slide-drawer-left">
          <Link to="/chats">
            <Button className="slide-drawer-button">
              <IoChatbubbleOutline size={18} />
            </Button>
          </Link>
          <div className="slide-drawer-actions">
            <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
              <Button className="slide-drawer-button" onClick={onOpen}>
                <IoSearchOutline size={18} />
              </Button>
            </Tooltip>
            <Link to="/games">
              <Button className="slide-drawer-button">
                <IoGameControllerOutline size={18} />
              </Button>
            </Link>
          </div>
        </div>
        <div className="slide-drawer-right">
          <Menu>
            <MenuButton as={Button} className="slide-drawer-avatar-button" rightIcon={<ChevronDownIcon />}>
              <RxAvatar size={18} cursor="pointer" />
            </MenuButton>
            <MenuList className="chakra-menu__menu-list">
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" display="flex" justifyContent="space-between" alignItems="center">
            Search Users
            <CloseButton onClick={onClose} />
          </DrawerHeader>
          <DrawerBody>
            <Box mb={4}>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={HandleSearch}
                className='chakra-input'
              />
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResults.map((user, idx) => (
                <UserList user={user} key={idx} handleFunction={() => accessChat(user._id)} />
              ))
            )}
            {loadingchat && <Spinner mt={4} />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SlideDrawer;
