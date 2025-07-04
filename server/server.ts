import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import userRoutes from './routes/user-routes';
import chatRoutes from './routes/chat-routes';
import messageRoutes from './routes/message-routes';
import { ErrorHandler, NotFound } from './middlewares/error-middleware';
import cors from 'cors';
import { Server } from 'socket.io';
import {
  ChatProps,
  JoinRoomPayload,
  MessageProps,
  RoomUser,
  SocketEmitNames,
  SocketNames,
  TicTacSockets,
  TimerPayloadProps,
  UserProps,
} from './types';
import { addUser } from './utils/user';
import {
  AddUser,
  NewGame,
  GetGameDetail,
  CheckWin,
  RemoveRoom,
  UserLeft,
} from './utils/tictactoe';

dotenv.config();
connectDB();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ['https://livenetworkgames.netlify.app',
	    'http://localhost:5173'],
  }),
);

// Routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use(NotFound);
app.use(ErrorHandler);

// Server Listen
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is Running on PORT : ${PORT} 🚀`);
});

// Socket IO
const io: Server = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ['https://livenetworkgames.netlify.app','http://localhost:5173'],
  },
});

let roomIdGlobal;

io.on('connection', (socket) => {
  // setup
  socket.on<SocketNames>('setup', (userData: UserProps) => {
    socket.join(userData._id);
    socket.emit<SocketEmitNames>('connected');
  });

  // join chat
  socket.on<SocketNames>('joinChat', (room: ChatProps) => {
    socket.join(room._id);
    console.log('User Joined Room: ' + room);
  });

  // typing
  socket.on<SocketNames>('typing', (room: ChatProps) => {
    socket.in(room._id).emit<SocketNames>('typing');
  });

  // stopTyping
  socket.on<SocketNames>('stopTyping', (room: ChatProps) => {
    socket.in(room._id).emit<SocketNames>('stopTyping');
  });

  // new Message
  socket.on<SocketNames>('newMessage', (newMessageReceived: MessageProps) => {
    const chat = newMessageReceived.chat;
    if (!chat?.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit<SocketEmitNames>(
        'messageReceived',
        newMessageReceived,
      );
    });
  });

  // socket Off
  socket.off('setup', (userData: UserProps) => {
    socket.leave(userData._id);
  });

 socket.on<TicTacSockets>('joinRoom', (payload: JoinRoomPayload) => {
		AddUser(socket.id, payload.roomId);

		const user: RoomUser = {
			socketId: socket.id,
			username: payload.username,
			roomId: payload.roomId,
		};

		NewGame(payload.roomId, payload.userId, payload.username);

		socket.join(user.roomId);

		socket.emit<TicTacSockets>('message', 'Welcome to MERN-Tic');
	});

	// Join Existing Room (TicTacToe)
	socket.on<TicTacSockets>('joinExistingRoom', (payload: JoinRoomPayload) => {
		AddUser(socket.id, payload.roomId);

		const user: RoomUser = {
			socketId: socket.id,
			username: payload.username,
			roomId: payload.roomId,
		};

		const roomExists = GetGameDetail(payload.roomId);

		if (!roomExists) {
			socket.emit<TicTacSockets>('message', {
				error: 'Room does not exist',
			});
			return;
		}

		if (!NewGame(payload.roomId, payload.userId, payload.username)) {
			socket.emit<TicTacSockets>('message', {
				error: 'Room is Full',
			});
			return;
		}

		socket.join(user.roomId);

		socket.emit<TicTacSockets>('message', 'Welcome to Mern TIC');

		socket
			.to(payload.roomId)
			.emit<TicTacSockets>('userJoined', `${payload.username} joined the game`);

		return;
	});

	// Users Entered (TicTacToe)
	socket.on<TicTacSockets>('usersEntered', (payload: JoinRoomPayload) => {
		console.log('Users Entered');
		const current_game = GetGameDetail(payload.roomId);

		if (!current_game) {
			return;
		}

		if (current_game.user1.userId === payload.userId) {
			current_game.user1.inGame = true;
		} else if (current_game.user2.userId === payload.userId) {
			current_game.user2.inGame = true;
		}

		if (current_game.user1.inGame && current_game.user2.inGame) {
			io.in(payload.roomId).emit<TicTacSockets>('usersEntered', {
				user1: current_game.user1,
				user2: current_game.user2,
			});
		}
	});

	// Move (TicTacToe)
	socket.on<TicTacSockets>('move', async (payload: JoinRoomPayload) => {
		const current_room = GetGameDetail(payload.roomId)!;
		let current_username;
		let moveCount;

		if (!current_room.user1.userId || !current_room.user2.userId) {
			io.in(payload.roomId).emit<TicTacSockets>('userLeave', {});
		}

		if (current_room?.user1.userId === payload.userId) {
			current_room.user1.moves.push(payload.move);
			moveCount = current_room.user1.moves.length;
			current_username = current_room.user1.username;
		} else {
			current_room?.user2.moves.push(payload.move);
			moveCount = current_room?.user2.moves.length;
			current_username = current_room?.user2.username;
		}

		io.in(payload.roomId).emit<TicTacSockets>('move', {
			move: payload.move,
			userId: payload.userId,
		});

		if (moveCount >= 3) {
			const { isWin, winCount, pattern } = CheckWin(
				payload.roomId,
				payload.userId,
			);

			if (isWin) {
				io.in(payload.roomId).emit<TicTacSockets>('win', {
					userId: payload.userId,
					username: current_username,
					pattern,
				});
				return;
			}

			if (
				current_room?.user1.moves.length + current_room.user2.moves.length >=
				9
			) {
				io.in(payload.roomId).emit<TicTacSockets>('draw', {
					roomId: payload.roomId,
				});
				return;
			}
		}
	});

	// Rematch (TicTacToe)
	socket.on<TicTacSockets>('reMatch', (payload: JoinRoomPayload) => {
		let currGameDetail = GetGameDetail(payload.roomId)!;
		currGameDetail.user1.moves = [];
		currGameDetail.user2.moves = [];

		io.in(payload.roomId).emit<TicTacSockets>('reMatch', {
			currGameDetail,
		});
	});

	// Remove Room (TicTacToe)
	socket.on<TicTacSockets>('removeRoom', (payload: JoinRoomPayload) => {
		io.in(payload.roomId).emit('removeRoom', 'remove');
		RemoveRoom(payload.roomId);
	});
});
