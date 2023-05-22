import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ActivePools from "./components/activepools";
import Swap from './components/swap';
import Header from './components/header';

function App() {
  return (
    <>
      <Header/>
      {/* <ActivePools/> */}
      <Swap/>
    
    </>
  )
}

export default App
