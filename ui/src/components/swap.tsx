import "./swap.css";
import SearchComponent from "./searchComponent";
import TokenList from "./tokenlist";
import { useState,useRef, useEffect } from "react";
import SwapButton from "./swapButton";
import { fetchBalance} from '@wagmi/core'
import { readContract } from '@wagmi/core'
import ERC20ABI from "../../ABI/ERC20ABI.json";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

export default function Swap(){
    const ethLogoPath = "https://res.cloudinary.com/sushi-cdn/image/fetch/f_auto,fl_sanitize,q_auto,w_48/https://raw.githubusercontent.com/sushiswap/list/master/logos/native-currency-logos/ethereum.svg";
    const [showModal, setShowModal] = useState(false);
    const [searchFocused,setSearchFocused] = useState(false);
    const [activeModalId,setactiveModalId] = useState(0);
    const [inputValue1,setInputValue1] = useState('');
    const [inputValue2,setInputValue2] = useState('');
    const [selectedToken1,setSelectedToken1] = useState({
        name:'Ether',
        symbol:'ETH',
        address:'ethereum',
        logo:`${ethLogoPath}`,
        balance:'NaN'
    });
    const [selectedToken2,setSelectedToken2] = useState({
        name:'Select token',
        symbol:'',
        address:'',
        logo:'',
        balance:'NaN'
    });

    const [searchedToken,setSearchedToken] = useState({
        name:'',
        symbol:'',
        address:''
    });
    const [isConnected,setIsConnected] = useState(false); 

    const ref = useRef(null);

    type tokendata ={
        name:string;
        symbol:string;
        address:string;
    }
    type choosenToken = {
        name:string;
        symbol:string;
        address:string;
        logo:string;
        balance:string;

    }
    type updatedToken = {
        name:string;
        symbol:string;
        address:string;
        logo:string;
    }
    // Skeleton token list on search select
    useEffect(()=>{

        if(document.activeElement != ref.current){
            setSearchFocused(false);
        }

    },[document.activeElement])


    // console.log("Selected token1: ",selectedToken1);
    // console.log("Selected token 2: ",selectedToken2);

    // Token selection box
    function tokenBox(modalId:number,logo:string,symbol:string,tickerDesign:string,balance:string){
        
        return(
            <>
                <div className="box">
                    <div className="boxInner">
                        <div className="boxInput">
                            <input placeholder="0" value={modalId == 1? inputValue1:inputValue2} onChange={(event)=>{
                                const data = event.target.value;
                                modalId == 1? setInputValue1(data):setInputValue2(data);
                            }}></input>
                        </div>
                        <div className="tickerContainer " id={tickerDesign} >
                            {tickerDesign=="firstTicker"?
                                <button onClick={()=>{
                                    setShowModal(!showModal);
                                    setactiveModalId(modalId);
                                    }} >
                                    
                                    <div className="tickerwrapper py-2  ">
                                        <div className="tickerlogoContainer border  ">
                                            <img src={logo}></img>
                                        </div>
                                        <h3 className="text-sm pt-1 pl-1 font-medium antialiased ">{symbol}</h3>
                                        <div className="svgContainer pl-2 ">
                                            <svg width="30" height="30" version="1.1" viewBox="70 110 450 300" fill="black" xmlns="http://www.w3.org/2000/svg">
                                                <path d="m277.89 214.98c-3.6953-5.2773-10.969-6.5625-16.246-2.8672-5.2773 3.6953-6.5625 10.969-2.8672 16.246l81.664 116.67c4.6484 6.6367 14.473 6.6367 19.117 0l81.668-116.67c3.6953-5.2773 2.4102-12.551-2.8672-16.246-5.2812-3.6953-12.555-2.4102-16.25 2.8672l-72.109 103.01z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </button>

                            :
                                <button onClick={()=>{
                                    setShowModal(!showModal);
                                    setactiveModalId(2);

                                }}>
                                    <div className="tickerwrapper flex items-center py-2 pl-1">

                                        <h3 className="text-sm font-medium">Select token</h3>
                                        <div className="svgContainer">
                                            <svg width="30" height="30" version="1.1" viewBox="70 105 450 300" fill="white" xmlns="http://www.w3.org/2000/svg">
                                                <path d="m277.89 214.98c-3.6953-5.2773-10.969-6.5625-16.246-2.8672-5.2773 3.6953-6.5625 10.969-2.8672 16.246l81.664 116.67c4.6484 6.6367 14.473 6.6367 19.117 0l81.668-116.67c3.6953-5.2773 2.4102-12.551-2.8672-16.246-5.2812-3.6953-12.555-2.4102-16.25 2.8672l-72.109 103.01z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            }
                        </div>
                    </div>
                    <div className="flex justify-between">

                        <p className="pl-5 text-sm cursor-pointer font-medium hover:opacity-80 underline decoration-pink-800 text-pink-600" onClick={()=>{
                            modalId == 1? setInputValue1(selectedToken1.balance):setInputValue2(selectedToken2.balance);
                            
                        }}>Max</p>
                        <p className="balance ">Balance: {balance} </p>

                    </div>
                </div>
            </>
        )

    }

    // Check if the account is connected or not
    const account = useAccount({
        onConnect({ address, connector, isReconnected }) {
          setIsConnected(true);  
          console.log('Connected', { address, connector, isReconnected })
        },
      });

    // console.log("Account : ",account);


    async function setEthBalance(tickernumber:string){
        if(account.address != undefined){

            const addr:string= account.address;
            const ethBalance = await fetchBalance({
                address:ethers.utils.getAddress(addr),
            });
    
            if(tickernumber == '1'){
    
                setSelectedToken1((obj)=>{
                    return{
                        ...obj,
                        balance:ethBalance.formatted.slice(0,8)
                    }
                })
            }
            else if(tickernumber == '2'){
                setSelectedToken2((obj)=>{
                    return{
                        ...obj,
                        balance:ethBalance.formatted.slice(0,8)
                    }
                })
            }
        }

    }

    async function setTokenBalance(tickernumber:string) {
        const addr:string = tickernumber == '1'?selectedToken1.address:selectedToken2.address;

        const tokenBalance:any = await readContract({
            address:ethers.utils.getAddress(addr),
            abi:ERC20ABI,
            functionName:`balanceOf`,
            args: [`${account.address}`],

        });

        
        const parsedValue = ethers.utils.formatEther(tokenBalance).slice(0,8);

        if(tickernumber == '1'){

            setSelectedToken1((obj)=>{
                return{
                    ...obj,
                    balance:parsedValue
                }
            })
        }
        else if(tickernumber == '2'){
            setSelectedToken2((obj)=>{
                return{
                    ...obj,
                    balance:parsedValue
                }
            })
        }

        
    }

    // Fetch balance of the connected account
    async function getBalance(){
        // Check if the account is connected or not
        if(account.isConnected){
            // Read balance of the token 1 
            // Check if the token 1 is ETH
            if(selectedToken1.name == 'Ether'){

                setEthBalance('1');
    
            }
            else{
                setTokenBalance('1');
            }

            // For token2
            // Check if token is selected or not
            if(selectedToken2.name != 'Select token'){

                // Check if the token 2 is ETH
                if(selectedToken2.name == 'Ether'){
                    setEthBalance('2');        
                }
                else{

                    setTokenBalance('2');
                }
            }
    
        }
    }

    function flipTickerData(){
        const box1 = selectedToken1;

        // Update selectedtoken1 with selectedtoken2 data
        setSelectedToken1((obj)=>{
            return{
                ...obj,
                ...selectedToken2
            }
        });

        // Update selectedtoken2 with selectedtoken1 data
        setSelectedToken2((obj)=>{
            return{
                ...obj,
                ...box1,
            }
        })

        // Flip input box data
        const input1 = inputValue1;
        setInputValue1(inputValue2);
        setInputValue2(input1);


    }

    useEffect(()=>{
        if(showModal == false){
            getBalance();
        }
    },[isConnected,showModal])



    return (
        <>

            <div className="swapContainer">                
                <div className="dexContainer pt-12 ">
                    <div className="dexHeader pb-4">                        
                        <h2 className="text-xl font-semibold">Swap Token </h2>  
                        <h4 className="text-md font-semibold">Pool status: NaN</h4>  
                    </div>

                    <div className="dexinnerContainer">
                        {/* First ticker box */}
                        {tokenBox(1,selectedToken1.logo,selectedToken1.symbol,"firstTicker",selectedToken1.balance)}
                        <div className="dexDivider"></div>
                        <div className="motionContainer " onClick={flipTickerData} >
                            <div className="flipIconContainer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 -5 23 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>            

                            </div>

                        </div>
                        {selectedToken2.name == 'Select token'?
                            <>
                                {/* Second ticker default */}
                                {tokenBox(2,selectedToken2.logo,selectedToken2.symbol,"secondTicker",'NaN')}
                                
                            </>
                                :
                            <>
                                {/* Second ticker box */}
                                {tokenBox(2,selectedToken2.logo,selectedToken2.symbol,"firstTicker",selectedToken2.balance)}
                            
                            </>
                        }

                        {/* Swap button */}
                        <SwapButton/>

                    </div>

                </div>

            </div>

            {showModal&&(
                <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 bottom-42 z-50 outline-none focus:outline-none backdrop-blur  transition ease-in-out" onClick={(event)=>{

                        if (event.target === event.currentTarget) {
                            setShowModal(false);
                            setactiveModalId(0);
                        }

                        }}>
                        <div className="relative  w-1/4 my-6 mx-auto  ">
                        {/*content*/}
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none" onClick={(event)=>{
                            if(event.target != ref.current){
                                setSearchFocused(false);
                            }
                        }}>
                            {/*header*/}
                            <div className="modalHeader border-b pt-3 pb-5 pl-2" >
                                <div className="flex items-start justify-between p-5 rounded-t">        
                                    <h3 className="text-xl font-semibold">
                                        Select a token
                                    </h3>
                                    <button
                                        className="pb-1 pr-1  ml-auto  bg-transparent text-black opacity-30 float-right leading-none font-medium outline-none focus:outline-none "
                                        onClick={() => {
                                            setShowModal(false);
                                            setactiveModalId(0);
                                        }}
                                    >
                                        <span className="opacity-20 h-6 w-6 text-xl inline-block outline-none focus:outline-none ">
                                        x
                                        </span>
                                    </button>
                                </div>

                                {/* Search bar */}
                                <SearchComponent search={(value:boolean)=>{
                                    setSearchFocused(value);
                                }} 
                                reference={ref} 
                                setSearchData={(value:tokendata)=>{
                                    setSearchedToken((obj:tokendata)=>{
                                        return{
                                            ...obj,
                                            ...value,
                                        }
                                    });
                                }}/>
                            </div>

                            {/*body*/}
                            <div className="relative pt-6 flex-auto">
                                <TokenList 
                                skeleton={searchFocused} 
                                closeModal={()=>{setShowModal((value)=>{return !value})}} 
                                searchedToken={searchedToken} 
                                modalId={activeModalId} 
                                updateToken1={(data:updatedToken)=>{setSelectedToken1((obj:choosenToken)=>{return{...obj,...data}})}} 
                                updateToken2={(data:updatedToken)=>{setSelectedToken2((obj:choosenToken)=>{return{...obj,...data}})}}
                                token1= {selectedToken1}
                                token2={selectedToken2}
                                />
  
                            </div>
                        </div>

                        </div>

                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            )}

                                

        </>
    )
}