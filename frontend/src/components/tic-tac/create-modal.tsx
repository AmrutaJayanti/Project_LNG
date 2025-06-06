import { Fragment, useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { CreateRoomSVG } from '../illustrations';
import { nanoid } from 'nanoid';
import { useAppSelector } from '../../store/hook';
import { Button, FormControl, Input } from '@chakra-ui/react';
import { Socket } from 'socket.io-client';
import type { TicTacSockets } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  BsFillClipboardFill,
  BsFillClipboardCheckFill,
} from 'react-icons/bs';
import '../../styles/joinModal.css';

type Props = {
  createModal: boolean;
  setCreateModal: (value: boolean) => void;
  socket: Socket;
};

const roomId: string = nanoid(7);

function CreateModal({ createModal, setCreateModal, socket }: Props) {
  const navigate = useNavigate();
  const { userName, userId } = useAppSelector((state) => state.ticUser.user);
  const [copied, setCopied] = useState(false);

  const closeModal = () => setCreateModal(false);

  const copyText = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  useEffect(() => {
    socket.emit<TicTacSockets>('joinRoom', {
      username: userName,
      userId,
      roomId,
    });
  }, [socket]);

  useEffect(() => {
    socket.on<TicTacSockets>('message', (payload) => {});
    socket.on<TicTacSockets>('message', (message) => {});
  }, [socket]);

  return (
    <Transition appear show={createModal} as={Fragment}>
      <Dialog as="div" className="join-modal" onClose={closeModal}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="join-modal-backdrop" />
        </TransitionChild>

        <div className="join-modal-container">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="join-modal-panel">
              <DialogTitle as="h3" className="join-modal-title">
                Create Room
              </DialogTitle>

              <div className="join-modal-content">
                <CreateRoomSVG className="create-room-svg" />

                <FormControl className="join-form-control">
                  <Input
                    className="join-input"
                    value={roomId}
                    readOnly
                    size="sm"
                    variant={'unstyled'}
                  />
                  <Button className="join-button" onClick={copyText}>
                    {copied ? (
                      <BsFillClipboardCheckFill size={18} />
                    ) : (
                      <BsFillClipboardFill size={18} />
                    )}
                  </Button>
                </FormControl>

                <button
                  className="join-play-button"
                  onClick={() => navigate(`/tic-tac-toe/${roomId}`)}
                  type="submit"
                >
                  Create Room
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

export default CreateModal;
