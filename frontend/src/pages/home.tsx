import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/auth/login';
import SignUp from '../components/auth/sign-up';
import logo from '../assets/images/Logo.png'; 
import '../styles/home.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (user && Object.keys(user).length > 0) navigate('/chats');
  }, [navigate]);

  return (
    <div className="homepage-bg">
      <Container maxW="md" centerContent className="glass-container">
        <Box textAlign="center">
          <img src={logo} alt="App Logo" className="logo-image" />
          <Text className="heading-text">Live Networks & Games</Text>
        </Box>

        <Box className="tabs-container" w="full">
          <Tabs variant="soft-rounded" colorScheme="blue" isFitted>
            <TabList mb={4}>
              <Tab aria-label="Login tab">Login</Tab>
              <Tab aria-label="Sign Up tab">Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <SignUp />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </div>
  );
};

export default HomePage;