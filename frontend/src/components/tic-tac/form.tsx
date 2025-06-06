import { Button, FormControl, Input, Stack, useToast } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { addUser } from '../../store/actions/tic-actions';
import { useAppDispatch } from '../../store/hook';
import type { TicRoomTypesProps } from '../../types';
import { CreateRoomSVG, JoinRoomSVG } from '../illustrations';
import { IoArrowBackOutline } from 'react-icons/io5';
import CreateModal from './create-modal';
import JoinModal from './join-modal';
import { Socket } from 'socket.io-client';
import { ChatState } from '../../context/chat-provider';
import '../../styles/ticTacToe.css';

const roomTypebtns: TicRoomTypesProps = [
  { type: 'create', text: 'Create Room' },
  { type: 'join', text: 'Join Room' },
];

interface TicTacFormProps {
  socket: Socket;
}

const TicTacForm: React.FC<TicTacFormProps> = ({ socket }) => {
  const { user } = ChatState();
  const userId: string = nanoid(5);
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [userName, setUserName] = useState<string>(user.name);
  const [show, setShow] = useState<boolean>(false);
  const [activeBtn, setActiveBtn] = useState('');
  const [createModal, setCreateModal] = useState<boolean>(false);
  const [joinModal, setJoinModal] = useState<boolean>(false);

  function handleClick() {
    if (userName === '') {
      toast({
        title: 'Please enter user name!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }
    dispatch(addUser(userName, userId));
    setShow(true);
  }

  return (
    <div className="ticTacFormContainer">
      {!show ? (
        <FormControl className="chakra-form-control">
          <Input
            className="chakra-input"
            placeholder="Enter your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            spellCheck={false}
          />
          <Button className="modal-button" onClick={handleClick}>
            Start Game
          </Button>
        </FormControl>
      ) : (
        <Stack>
          <button className="back-button" onClick={() => setShow(false)}>
            <IoArrowBackOutline size={17} />
          </button>
          <div className="flex flex-col md:flex-row items-center gap-2">
            {roomTypebtns.map((type, idx) => (
              <div
                key={idx}
                className={`ticBtn ${activeBtn === type.type ? 'active' : ''}`}
                onClick={() => {
                  setActiveBtn(type.type);
                  type.type === 'create' ? setCreateModal(true) : setJoinModal(true);
                }}
              >
                {type.type === 'create' ? <CreateRoomSVG /> : <JoinRoomSVG />}
                <h3>{type.text}</h3>
              </div>
            ))}
          </div>
        </Stack>
      )}
      <CreateModal createModal={createModal} setCreateModal={setCreateModal} socket={socket} />
      <JoinModal joinModal={joinModal} setJoinModal={setJoinModal} socket={socket} />
    </div>
  );
};

export default TicTacForm;