import { createReducer } from '@reduxjs/toolkit';
import type { TicUserProps } from '../../types';

// Define your action type as a constant (recommended)
export const ADD_USER = 'AddUser';

const initialState: TicUserProps = {
  user: {
    userId: '',
    userName: '',
  },
};

export const ticUserReducer = createReducer(initialState, (builder) => {
  builder.addCase(ADD_USER, (state, action) => {
    console.log('action.payload', action.payload);
    state.user = action.payload;
  });
});
