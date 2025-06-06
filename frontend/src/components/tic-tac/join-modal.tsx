import './../../styles/joinModal.css'; // import the CSS
import { Fragment, useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { JoinRoomSVG } from '../illustrations';
import { Button, FormControl, Input, useToast } from '@chakra-ui/react';
import { Socket } from 'socket.io-client';
import { useAppSelector } from '../../store/hook';
import type { TicTacSockets } from '../../types';
import { useNavigate } from 'react-router-dom';

type Props = {
	joinModal: boolean;
	setJoinModal: React.Dispatch<React.SetStateAction<boolean>>;
	socket: Socket;
};

function JoinModal({ joinModal, setJoinModal, socket }: Props) {
	const { userName, userId } = useAppSelector((state) => state.ticUser.user);
	const toast = useToast();
	const navigate = useNavigate();
	const [joined, setJoined] = useState(false);
	const [roomId, setRoomId] = useState('');

	const handleClick = () => {
		if (!roomId.trim()) {
			toast({
				title: `Please enter a Room ID.`,
				status: 'warning',
				duration: 3000,
				isClosable: true,
				position: 'bottom',
			});
			return;
		}
		socket.emit<TicTacSockets>('joinExistingRoom', {
			username: userName,
			userId,
			roomId,
		});
	};

	useEffect(() => {
		setJoined(false);
		if (!userId) navigate('/games');

		socket.on<TicTacSockets>('message', (payload) => {
			console.log('payload', payload);
			if (payload === 'Welcome to Mern TIC') {
				setJoined(true);
			}
			if (payload.error) {
				toast({
					title: payload.error || 'Something went wrong.',
					status: 'error',
					duration: 5000,
					isClosable: true,
					position: 'bottom',
				});
			}
		});
	}, [userId, socket]);

	return (
		<Transition appear show={joinModal} as={Fragment}>
			<Dialog as="div" className="join-modal" onClose={() => setJoinModal(false)}>
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
								Join Room
							</DialogTitle>

							<div className="join-modal-content">
								<JoinRoomSVG />
								<FormControl className="join-form-control">
									<Input
										placeholder="Room ID"
										value={roomId}
										onChange={(e) => setRoomId(e.target.value)}
										className="join-input"
									/>
									<Button
										onClick={handleClick}
										disabled={joined}
										className="join-button"
									>
										{joined ? 'Joined' : 'Join'}
									</Button>
								</FormControl>

								{joined && (
									<button
										onClick={() => navigate(`/tic-tac-toe/${roomId}`)}
										className="join-play-button"
									>
										Play Game
									</button>
								)}
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
}

export default JoinModal;
