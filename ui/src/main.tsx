import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { goerli,configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';



const {chains, provider} = configureChains(
  [goerli],
  [publicProvider()]
);


const {connectors} = getDefaultWallets({
  appName: 'Bundleswap',
  chains
});

const wagmiClient = createClient({
  connectors,
  provider
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <WagmiConfig client={wagmiClient} >
    <RainbowKitProvider chains={chains} theme={
      lightTheme({
        accentColor:'#FF329C'
      })
    }>
      <App/>
    </RainbowKitProvider>
  </WagmiConfig>
)
