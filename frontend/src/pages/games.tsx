import { Box, Center, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import Lottie from 'react-lottie';
import { ChatState } from '../context/chat-provider';
import SlideDrawer from '../miscellaneous/Drawer';
import tictacAnimation from '../lottie/game.json';

import type { GameTypes, GamTypesBtns } from '../types';
import TicTacForm from '../components/tic-tac/form';
import { Socket } from 'socket.io-client';
import '../styles/game.css';

const gameTypes: GamTypesBtns[] = [
  {
    type: 'tic',
    name: 'Tic Tac Toe',
    color: 'red.200',
  },
];

interface GamePageProps {
  socket: Socket;
  setUser: any;
}

const GamePage: React.FC<GamePageProps> = ({ socket, setUser }) => {
  const { user: loggedInUser } = ChatState();
  const [type, setType] = useState<GameTypes>('canvas');

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData:    
         tictacAnimation
        ,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="gameWrapper">
      {loggedInUser && <SlideDrawer />}
      <Box className="gameContainer">
        <Box className="gameTypeButtons">
          {gameTypes.map((game) => (
            <Center
              key={game.type}
              className={`gameTypeBtn ${type === game.type ? 'active' : ''}`}
              data-type={game.type}
              onClick={() => setType(game.type)}
            >
              {game.name}
            </Center>
          ))}
        </Box>
        <Stack className="gameFormContainer">
          <Box>
            <Lottie
              options={defaultOptions}
              className="lottie-animation"
              isClickToPauseDisabled
            />
            <Text className="gameTitle">
            'Tic Tac Toe'
            </Text>
          </Box>
          <div>
            {type === 'tic' && <TicTacForm socket={socket} />}
          </div>
        </Stack>
      </Box>
    </div>
  );
};

export default GamePage;