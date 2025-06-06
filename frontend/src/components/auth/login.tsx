import React, { useState } from 'react';
import { 
  FormControl, FormLabel, 
  Input, InputGroup, InputRightElement,
  Button, VStack, useToast 
} from '@chakra-ui/react';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);


  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: 'Please fill all the Fields!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
      return;
    }
    try {
      const config: AxiosRequestConfig = {
        baseURL: 'http://localhost:5000',
        headers: { 'Content-type': 'application/json' },
      };
      const { data } = await axios.post(
        '/api/user/login',
        { email, password },
        config,
      );
      toast({
        title: 'Login Successful!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      navigate('/chats');
    } catch (error: any) {
      setLoading(false);
      toast({
        title: 'Something went wrong',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  return (
    <VStack spacing={5} className="login-form">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
          _placeholder={{ color: '#07111e' }}
          width="100%"
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            value={password}
            type={show ? 'text' : 'password'}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
            _placeholder={{ color: '#07111e' }}
          />
        </InputGroup>
      </FormControl>
      <Button
        width="50%"
        mt={4}
        onClick={submitHandler}
        disabled={loading}
        isLoading={loading}
      >
        Login
      </Button>
      <Button
        variant="solid"
        colorScheme="gray"
        width="50%"
        mt={2}
        onClick={() => {
          setEmail('guest@example.com');
          setPassword('123456');
        }}
      >
        Login as Guest
      </Button>
    </VStack>
  );
};

export default Login;
