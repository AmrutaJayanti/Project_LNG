import { Avatar, Box, Text } from '@chakra-ui/react';
import React from 'react';
import type { UserProps } from '../../types';

interface UserListProps {
  user: UserProps;
  handleFunction: () => void;
}

const UserList: React.FC<UserListProps> = ({ user, handleFunction }) => {
  return (
    <Box
      className="user-list-item"
      onClick={handleFunction}
    >
      <Avatar
        mr={2}
        size="xs"
        cursor="pointer"
        name={user.name}
      />
      <Box>
        <Text className="user-list-item-text">{user.name}</Text>
        <Text className="user-list-item-email">
          <b>Email: </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserList;