import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import TicHeader from '../components/tic-tac/tic-header';
import TicScore from '../components/tic-tac/tic-score';
import { ChatState } from '../context/chat-provider';
import SlideDrawer from '../miscellaneous/Drawer';
import { useAppSelector } from '../store/hook';
import type { MoveProps, TicGameDetails, TicTacSockets, WinPayloadProps } from '../types';
import { moves as defaultMoves } from '../util/constants';
import './../styles/ticTacToe.css';
import { Alert, AlertIcon, AlertTitle, useToast } from '@chakra-ui/react';

interface TicTacToePageProps {
  socket: Socket;
}

const TicTacToePage: React.FC<TicTacToePageProps> = ({ socket }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: loggedInUser } = ChatState();
  const { user } = useAppSelector((state) => state.ticUser);
  const params = useParams<{ roomId?: string }>();

  const [roomId, setRoomId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingValue, setLoadingValue] = useState<string>('waiting for another player...');
  const [userJoined, setUserJoined] = useState<boolean>(false);
  const [userTurn, setUserTurn] = useState<boolean>(false);
  const [oponentName, setOponentName] = useState<string>('');
  const [allMoves, setAllMoves] = useState<MoveProps[]>([]);
  const [movesState, setMovesState] = useState<MoveProps[]>(structuredClone(defaultMoves));
  const [winner, setWinner] = useState<string>('');
  const [winnerId, setWinnerId] = useState<string>('');
  const [winPattern, setWinPattern] = useState<any[]>([]);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const [leaveRoom, setLeaveRoom] = useState<boolean>(false);
  const [myScore, setMyScroe] = useState<number>(0);
  const [oponentScore, setOponentScore] = useState<number>(0);

  function handleClose() {
    socket.emit<TicTacSockets>('removeRoom', { roomId });
    navigate('/games');
    return true;
  }

  function handleMoveClick(m: number) {
    if (loading && !userJoined) {
      toast({
        title: `Cannot Click Right Now!`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }

    socket.emit<TicTacSockets>('move', {
      move: m,
      roomId,
      userId: user.userId,
    });

   moves[m].move = 1;
	 moves[m].myMove = true;


    setUserTurn(true);
  }

  function handlePlayAgain() {
    socket.emit<TicTacSockets>('reMatch', { roomId });
  }

useEffect(() => {
		window.onbeforeunload = function () {
			window.setTimeout(function () {
				navigate('/games');
				socket.emit<TicTacSockets>('removeRoom', { roomId });
			}, 0);
			window.onbeforeunload = null;
		};

		window.history.pushState(null, document.title, window.location.href);
		window.addEventListener('popstate', function () {
			window.history.pushState(null, document.title, this.window.location.href);
		});
	});
  
  useEffect(() => {
    if (!user) {
      navigate('/games');
      return;
    }

    socket.emit<TicTacSockets>('usersEntered', {
      roomId: params.roomId,
      userId: user.userId,
    });

    socket.on<TicTacSockets>('usersEntered', (data: TicGameDetails) => {
      setLoadingValue('');
if (data.user1.userId !== user.userId) {
				setOponentName(data.user1.username);
			} else {
				setOponentName(data.user2.username);
			}      setLoading(false);
    });
  }, [socket, user, params.roomId]);

  useEffect(() => {
		setRoomId(params.roomId!);
	}, [params.roomId]);


useEffect(() => {
		socket.on<TicTacSockets>('move', (payload: MoveProps) => {
			console.log('move payload =>', payload);
			setMove({
				move: payload.move,
				myMove: payload.userId === user.userId,
			});
			setAllMoves([...allMoves, move]);

			moves[payload.move].move = 1;
			moves[payload.move].myMove = payload.userId === user.userId;

			if (payload.userId !== user.userId) {
				setUserTurn(false);
			}
		});

		socket.on<TicTacSockets>('win', (payload: WinPayloadProps) => {
			console.log('win payload =>', payload);
			setWinPattern(payload.pattern);
			setGameEnd(true);
			if (payload.userId === user.userId) {
				setWinner('You Won!');
				setMyScroe(myScore + 1);
			} else {
				setWinner(`You lost!, ${payload.username} won!`);
				setOponentScore(oponentScore + 1);
			}
			setWinnerId(payload.userId);
			setUserTurn(false);
		});

		socket.on<TicTacSockets>('draw', () => {
			setWinner('Draw!');
			setGameEnd(true);
			setUserTurn(false);
			setLoadingValue('');
		});
	}, []);


useEffect(() => {
		socket.on<TicTacSockets>('reMatch', () => {
			moves.forEach((m) => {
				m.move = -1;
				m.myMove = false;
			});
			setWinner('');

			setUserTurn(user.userId !== winnerId);
			setGameEnd(false);
		});

		socket.on<TicTacSockets>('removeRoom', (payload) => {
			console.log('removeRoom =>', payload);
			setUserJoined(false);
			setLeaveRoom(true);
		});
	});

useEffect(() => {
		socket.on<TicTacSockets>('userLeave', (payload: any) => {
			console.log('userLeave =>', payload);
			if (Object.keys(payload).length) {
				setLoadingValue('');
				toast({
					title: `${oponentName || 'Oponent'} left the game`,
					status: 'warning',
					duration: 5000,
					isClosable: true,
					position: 'bottom',
				});
				setLoading(true);
				setUserJoined(false);
			}
		});
	}, []);


  return (
    <div>
      {loggedInUser && <SlideDrawer />}
      <div className="mainWrapper">
        <TicHeader roomId={roomId} />
        <TicScore myScore={myScore} oponentName={oponentName} oponentScore={oponentScore} />

        {winner && winner !== 'Draw !' && winner.length > 0 && (
          <Alert status="info" width={460} mt={7} rounded="md">
            <AlertIcon />
            <AlertTitle> {winner}</AlertTitle>
          </Alert>
        )}

        {userTurn && (
          <Alert status="info" width={460} mt={7} rounded="md">
            <AlertIcon />
            <AlertTitle className="animate-pulse">Waiting for opponent response!</AlertTitle>
          </Alert>
        )}

        {loading && (
          <Alert status="info" width={460} mt={7} rounded="md">
            <AlertIcon />
            <AlertTitle className="animate-pulse">{loadingValue}</AlertTitle>
          </Alert>
        )}

        {(userTurn && loadingValue) || loading || gameEnd ? <div className="wait" /> : null}

        <div className="grid-container">
          {movesState.slice(1).map((m, idx) => (
            <div
              key={idx + 1}
              onClick={m.move === -1 && !winner ? () => handleMoveClick(idx + 1) : undefined}
              className={
                m.move === -1
                  ? `grid-item-hover grid-item${(idx + 1) % 3 !== 0 ? ' right' : ''}${idx < 6 ? ' bottom' : ''}`
                  : `grid-item${(idx + 1) % 3 !== 0 ? ' right' : ''}${idx < 6 ? ' bottom' : ''}`
              }
            >
              {m.move !== -1 ? (m.myMove ? '0' : 'X') : null}
            </div>
          ))}
        </div>

        {gameEnd && (
          <div className="flex items-center gap-3 my-7">
            <form onSubmit={handleClose}>
              <button className="closeBtn">Close</button>
            </form>
            {!leaveRoom && (
              <button onClick={handlePlayAgain} className="playAgain">
                Play Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToePage;
