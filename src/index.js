import React from 'react';

// Routers
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

// redux
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './store';

// css
import './index.css';
import 'bootstrap/dist/css/bootstrap.css'

// components
import AppRouter from './components/AppRouter';
import reportWebVitals from './reportWebVitals';

// RainbowKit
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { chains, wagmiConfig } from './wagmi.config'; 

const { store, persistor } = configureStore();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <Router>
              <AppRouter />
            </Router>
          </RainbowKitProvider>
        </WagmiConfig>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
