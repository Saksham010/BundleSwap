import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {ConnectButton} from "@rainbow-me/rainbowkit";
import ActivePools from "./components/activepools";

function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>BundleSwap</h1>
      <ConnectButton />
      <ActivePools/>
    
    </>
  )
}

export default App
