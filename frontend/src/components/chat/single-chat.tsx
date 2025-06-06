import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Box,
  IconButton,
  Spinner,
  Text,
  FormControl,
  Input,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatState } from '../../context/chat-provider';
import type { ChatBoxProps } from './chat-box';
import { getFullSender, getSender } from '../../config/chat-logic';
import ProfileModal from '../../miscellaneous/profile-modal';
import UpdateGroupChat from './update-group-chat';
import type { ChatProps, MessageProps, SocketNames } from '../../types';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import ScrollableChat from '../messages/scrollable-chat';
import io, { Socket } from 'socket.io-client';
import { PROD_ENDPOINT } from '../../util/constants';
import Lottie from 'react-lottie';
import animationData from '../../lottie/animation.json';

var socket: Socket;
var selectedChatCompare: ChatProps;

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

const SingleChat: React.FC<ChatBoxProps> = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const toast = useToast();
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    socket = io(PROD_ENDPOINT);
    socket.emit<SocketNames>('setup', user);
    socket.on<SocketNames>('connected', () => setSocketConnected(true));
    socket.on<SocketNames>('typing', () => setIsTyping(true));
    socket.on<SocketNames>('stopTyping', () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on<SocketNames>(
      'messageReceived',
      (newMessageReceived: MessageProps) => {
        if (
          !selectedChatCompare ||
          selectedChatCompare._id !== newMessageReceived.chat._id
        ) {
          if (!notification.includes(newMessageReceived)) {
            setNotification([newMessageReceived, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          setMessages([...messages, newMessageReceived]);
        }
      },
    );
  });

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config: AxiosRequestConfig = {
        baseURL: 'http://localhost:5000',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config,
      );
      setMessages(data);
      setLoading(false);
      socket.emit<SocketNames>('joinChat', selectedChat._id);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Something went wrong in Fetching Messages!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };

  const sendMessage = async (e: KeyboardEvent | any) => {
    if (e.key === 'Enter' && newMessage) {
      socket.emit<SocketNames>('stopTyping', selectedChat._id);
      try {
        const config: AxiosRequestConfig = {
          baseURL: 'http://localhost:5000',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        };
        setNewMessage('');
        const { data } = await axios.post(
          '/api/message',
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config,
        );
        socket.emit<SocketNames>('newMessage', data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Something went wrong!',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });
      }
    }
  };

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setNewMessage(value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit<SocketNames>('typing', selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength: number = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit<SocketNames>('stopTyping', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            className="chat-header"
            pb={3}
            px={2}
            w="100%"
            display="flex"
            gap="7px"
            justifyContent={{
              base: 'space-between',
            }}
            alignItems="center"
          >
            <IconButton
              display={{
                base: 'flex',
                md: 'none',
              }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
              aria-label="back button"
            />
            {!selectedChat.isGroupChat ? (
              <>
                <Text className="chat-header-text">{getSender(user, selectedChat.users)}</Text>
                <ProfileModal user={getFullSender(user, selectedChat.users)} />
              </>
            ) : (
              <>
                <Text className="chat-header-text">{selectedChat.chatName.toUpperCase()}</Text>
                <UpdateGroupChat
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Box>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={19}
                h={19}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              isRequired
              mt={3}
              className="chat-input"
            >
              {isTyping ? (
                <div className="lottie-animation">
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{
                      marginBottom: 15,
                      marginLeft: 0,
                    }}
                  />
                </div>
              ) : null}
              <Input
                placeholder="Enter a message..."
                onChange={typingHandler}
                value={newMessage}
                className='chakra-input'
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text className="no-chat-text">
            Click on a user to start Chatting.
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;