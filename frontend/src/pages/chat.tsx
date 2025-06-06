import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import ChatBox from '../components/chat/chat-box';
import MyChats from '../components/chat/my-chats';
import { ChatState } from '../context/chat-provider';
import SlideDrawer from '../miscellaneous/Drawer';
import './../styles/chat.css';

const ChatPage: React.FC = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState<boolean>(false);

  return (
    <div className="chat-bg">
      {user && <SlideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        height="91.5vh"
        padding="10px"
        className="glass-container chat-header"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;