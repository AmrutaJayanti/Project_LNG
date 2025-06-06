import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import Store from './store/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={Store}>
      <ChakraProvider>
        <Router>
          <App />
        </Router>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);
