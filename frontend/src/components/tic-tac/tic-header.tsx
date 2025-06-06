import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import '../../styles/ticTacToe.css';

interface ITicHeader {
  roomId: string;
}

const TicHeader: React.FC<ITicHeader> = ({ roomId }) => {
  return (
    <div className="ticHeader">
      <h1>Tic Tac Toe</h1>
      <Popover>
        <PopoverTrigger>
          <button>
            <BsFillInfoCircleFill size={20} className="info-icon" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="chakra-popover__content">
          <PopoverArrow />
          <PopoverCloseButton className="chakra-popover__close-btn" />
          <PopoverHeader className="chakra-popover__header">Room Info!</PopoverHeader>
          <PopoverBody className="chakra-popoverbody">
            <div className="mb-2">
              <span className="font-bold">Room ID: </span> <span>{roomId}</span>
            </div>
            <p className="text-sm font-medium">
              You are now at the Tic-Tac-Toe Game Room.
            </p>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TicHeader;