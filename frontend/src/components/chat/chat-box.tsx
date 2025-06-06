import { Box } from '@chakra-ui/react';
import type { FC } from 'react';
import { ChatState } from '../../context/chat-provider';
import SingleChat from './single-chat';
import './../../styles/chat.css'

export interface ChatBoxProps {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBox: FC<ChatBoxProps> = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();
  return (
    <Box
      display={{
        base: selectedChat ? 'flex' : 'none',
        md: 'flex',
      }}
      alignItems="center"
      flexDir="column"
      p={3}
      w={{ base: '100%', md: '68%' }}
      borderRadius="lg"
      className="chat-box"
    >
      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </Box>
  );
};

export default ChatBox;