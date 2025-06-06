import { Box, Stack, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { ChatState } from '../../context/chat-provider';
import type { UserProps } from '../../types';
import ChatLoading from './chat-loading';
import { getSender } from '../../config/chat-logic';

interface MyChatsProps {
  fetchAgain: boolean;
}

const MyChats: FC<MyChatsProps> = ({ fetchAgain }) => {
  const toast = useToast();
  const [loggedUser, setLoggedUser] = useState<UserProps>();
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchChats = async () => {
    try {
      const config: AxiosRequestConfig = {
        baseURL: 'https://project-lng-1.onrender.com',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get('/api/chat', config);
      setChats(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to load the chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('userInfo')!));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      className="chat-pane"
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir="column"
      alignItems="center"
      w={{ base: '100%', md: '31%' }}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: '28px', md: '30px' }}
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text className="chat-header-text">Chats</Text>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={3}
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="auto"
      >
        {chats && !loading ? (
          <Stack overflowY="scroll">
            {chats.map((chat, idx) => (
              <Box
                key={idx}
                onClick={() => setSelectedChat(chat)}
                className="chat-list-item"
              >
                <Text className="chat-list-item-text">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <>{loading && <ChatLoading />}</>
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
