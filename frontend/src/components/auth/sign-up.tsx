import React, { useState } from 'react';
import { FormControl, FormLabel, Input, InputGroup, Button, VStack, useToast } from '@chakra-ui/react';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);


  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
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
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match!',
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
        baseURL: 'https://mern-chat-utlm.onrender.com',
        headers: { 'Content-type': 'application/json' },
      };
      const { data } = await axios.post(
        '/api/user',
        { name, email, password },
        config,
      );
      toast({
        title: 'Registration Successful',
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
    <VStack spacing={4} className="auth-form">
      <FormControl id="full-name" isRequired>
        <FormLabel>Full Name</FormLabel>
        <Input
          value={name}
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email" isRequired gap="15px">
        <FormLabel>Email </FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
            width="100%"
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            value={password}
            type= 'password'
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            value={confirmPassword}
            type= 'password'
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </InputGroup>
      </FormControl>
      <Button
        width="50%"
        onClick={submitHandler}
        isLoading={loading}
        disabled={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
