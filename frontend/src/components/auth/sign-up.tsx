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
  const [pic, setPic] = useState<any>();
  const [show, setShow] = useState<boolean>(false);
  const [confirmShow, setConfirmShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const postDetails = (pics: any) => {
    setLoading(true);
    if (!pics) {
      toast({
        title: 'Please select an Image!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
      return;
    }
    if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
      const data = new FormData();
      data.append('file', pics);
      data.append('upload_preset', 'chat-app');
      data.append('cloud_name', 'ttscloud');
      fetch('https://api.cloudinary.com/v1_1/ttscloud/image/upload', {
        method: 'POST',
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      toast({
        title: 'Please select a JPEG or PNG image!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };

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
        baseURL: 'https://project-lng-1.onrender.com',
        headers: { 'Content-type': 'application/json' },
      };
      const { data } = await axios.post(
        '/api/user',
        { name, email, password, pic },
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
            type={show ? 'text' : 'password'}
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
            type={confirmShow ? 'text' : 'password'}
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
